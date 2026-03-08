package io.shiveenp.glasspane.service

import io.shiveenp.glasspane.model.IndexedDirectory
import io.shiveenp.glasspane.repository.IndexedDirectoryRepository
import io.shiveenp.glasspane.repository.IndexedFileRepository
import io.shiveenp.glasspane.repository.model.IndexedDirectory as IndexedDirectoryEntity
import io.shiveenp.glasspane.repository.model.IndexedFile
import org.slf4j.LoggerFactory
import org.springframework.ai.reader.pdf.PagePdfDocumentReader
import org.springframework.ai.reader.tika.TikaDocumentReader
import org.springframework.ai.transformer.splitter.TokenTextSplitter
import org.springframework.ai.vectorstore.VectorStore
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder
import org.springframework.core.io.FileSystemResource
import org.springframework.stereotype.Service
import java.io.File
import java.time.Instant
import java.util.UUID

@Service
class IndexingService(
    private val indexedDirectoryRepository: IndexedDirectoryRepository,
    private val indexedFileRepository: IndexedFileRepository,
    private val vectorStore: VectorStore,
) {
    private val log = LoggerFactory.getLogger(IndexingService::class.java)
    private val textSplitter = TokenTextSplitter()

    fun listDirectories(): List<IndexedDirectory> =
        indexedDirectoryRepository.findAll().map { it.toDomain() }

    fun addDirectory(path: String): IndexedDirectory? {
        val dir = File(path).canonicalFile
        if (!dir.exists() || !dir.isDirectory) return null
        return indexedDirectoryRepository.save(IndexedDirectoryEntity(path = dir.absolutePath)).toDomain()
    }

    fun removeDirectory(id: UUID): Boolean {
        if (!indexedDirectoryRepository.existsById(id)) return false
        indexedDirectoryRepository.deleteById(id)
        return true
    }

    fun setDirectoryEnabled(id: UUID, enabled: Boolean): IndexedDirectory? {
        val entity = indexedDirectoryRepository.findById(id).orElse(null) ?: return null
        return indexedDirectoryRepository.save(entity.copy(enabled = enabled)).toDomain()
    }

    fun indexAll() {
        val directories = indexedDirectoryRepository.findAllByEnabledTrue()
        log.info("Starting indexing run for ${directories.size} directories")
        directories.forEach { indexDirectory(it) }
        cleanupOrphans()
        log.info("Indexing run complete")
    }

    fun cleanupOrphans() {
        val allIndexed = indexedFileRepository.findAll().toList()
        log.info("Checking {} indexed files for orphans", allIndexed.size)

        val orphans = allIndexed.filter { !File(it.path).exists() }
        if (orphans.isEmpty()) {
            log.info("No orphaned files found")
            return
        }

        log.info("Found {} orphaned files, cleaning up", orphans.size)
        orphans.forEach { orphan ->
            try {
                val filter = FilterExpressionBuilder().eq("filePath", orphan.path).build()
                vectorStore.delete(filter)
                indexedFileRepository.deleteById(orphan.id!!)
                log.debug("Cleaned up orphan: {}", orphan.path)
            } catch (e: Exception) {
                log.warn("Failed to clean up orphan {}: {}", orphan.path, e.message)
            }
        }
        log.info("Orphan cleanup complete")
    }

    private fun indexDirectory(dir: IndexedDirectoryEntity) {
        val root = File(dir.path)
        if (!root.exists() || !root.isDirectory) {
            log.warn("Skipping ${dir.path} — does not exist or is not a directory")
            return
        }

        log.info("Indexing directory: ${dir.path}")
        root.walkTopDown()
            .filter { it.isFile && isIndexable(it) }
            .forEach { file ->
                try {
                    indexFile(file)
                } catch (e: Exception) {
                    log.warn("Failed to index file ${file.absolutePath}: ${e.message}")
                }
            }

        indexedDirectoryRepository.save(dir.copy(lastIndexedAt = Instant.now()))
        log.info("Finished indexing directory: ${dir.path}")
    }

    private fun indexFile(file: File) {
        val fileLastModified = Instant.ofEpochMilli(file.lastModified())
        val existing = indexedFileRepository.findByPath(file.absolutePath)

        if (existing != null && !fileLastModified.isAfter(existing.lastModifiedAt)) {
            log.debug("Skipping unchanged file: {}", file.absolutePath)
            return
        }

        log.debug("Indexing file: {}", file.absolutePath)

        if (existing != null) {
            val filter = FilterExpressionBuilder().eq("filePath", file.absolutePath).build()
            vectorStore.delete(filter)
        }

        val resource = FileSystemResource(file)
        val documents = when (file.extension.lowercase()) {
            "pdf" -> PagePdfDocumentReader(resource).read()
            else -> TikaDocumentReader(resource).read()
        }

        if (documents.isEmpty()) return

        val chunks = textSplitter.apply(documents)
        chunks.forEach { doc ->
            doc.metadata["filePath"] = file.absolutePath
            doc.metadata["fileName"] = file.name
            doc.metadata["provider"] = "LOCAL"
        }

        vectorStore.add(chunks)

        indexedFileRepository.save(
            existing?.copy(lastModifiedAt = fileLastModified, indexedAt = Instant.now())
                ?: IndexedFile(path = file.absolutePath, lastModifiedAt = fileLastModified)
        )
    }

    private fun isIndexable(file: File): Boolean {
        val indexableExtensions = setOf(
            // documents
            "pdf", "doc", "docx", "odt", "rtf",
            // text
            "txt", "md", "markdown", "rst", "adoc",
            // code
            "kt", "java", "py", "js", "ts", "go", "rs", "rb", "cs", "cpp", "c", "h",
            "swift", "sh", "yaml", "yml", "toml", "json", "xml", "html", "css",
            // data / config
            "csv", "properties", "env",
        )
        return file.extension.lowercase() in indexableExtensions
            && !file.isHidden
            && file.length() < MAX_FILE_SIZE_BYTES
    }

    companion object {
        private const val MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024L // 50MB
    }
}
