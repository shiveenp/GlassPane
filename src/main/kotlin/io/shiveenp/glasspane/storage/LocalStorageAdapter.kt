package io.shiveenp.glasspane.storage

import io.shiveenp.glasspane.model.StorageItem
import io.shiveenp.glasspane.model.StorageItemType
import io.shiveenp.glasspane.model.StorageProvider
import org.springframework.stereotype.Component
import java.io.File
import java.nio.file.Files
import java.time.Instant

@Component
class LocalStorageAdapter(
    private val basePath: String = System.getProperty("user.home")
) : StorageAdapter {

    override fun getStorageItems(): List<StorageItem> {
        val baseDir = File(basePath)

        if (!baseDir.exists() || !baseDir.isDirectory) {
            return emptyList()
        }

        return baseDir.listFiles()?.mapNotNull { file ->
            try {
                val path = file.toPath()
                val attrs = Files.readAttributes(path, "basic:*") as Map<*, *>

                StorageItem(
                    id = file.absolutePath,
                    name = file.name,
                    path = file.absolutePath,
                    itemType = if (file.isDirectory) StorageItemType.DIRECTORY else StorageItemType.FILE,
                    provider = StorageProvider.LOCAL,
                    size = if (file.isFile) file.length() else 0L,
                    createdAt = (attrs["creationTime"] as? java.nio.file.attribute.FileTime)?.toInstant() ?: Instant.now(),
                    modifiedAt = Instant.ofEpochMilli(file.lastModified()),
                    mimeType = if (file.isFile) Files.probeContentType(path) else null
                )
            } catch (e: Exception) {
                null
            }
        } ?: emptyList()
    }

    fun getStorageItemsFromPath(path: String): List<StorageItem> {
        val dir = File(path)

        if (!dir.exists() || !dir.isDirectory) {
            return emptyList()
        }

        return dir.listFiles()?.mapNotNull { file ->
            try {
                val filePath = file.toPath()
                val attrs = Files.readAttributes(filePath, "basic:*") as Map<*, *>

                StorageItem(
                    id = file.absolutePath,
                    name = file.name,
                    path = file.absolutePath,
                    itemType = if (file.isDirectory) StorageItemType.DIRECTORY else StorageItemType.FILE,
                    provider = StorageProvider.LOCAL,
                    size = if (file.isFile) file.length() else 0L,
                    createdAt = (attrs["creationTime"] as? java.nio.file.attribute.FileTime)?.toInstant() ?: Instant.now(),
                    modifiedAt = Instant.ofEpochMilli(file.lastModified()),
                    mimeType = if (file.isFile) Files.probeContentType(filePath) else null
                )
            } catch (e: Exception) {
                null
            }
        } ?: emptyList()
    }
}
