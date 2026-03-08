package io.shiveenp.glasspane.repository

import io.shiveenp.glasspane.repository.model.IndexedDirectory
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface IndexedDirectoryRepository : CrudRepository<IndexedDirectory, UUID> {
    fun findAllByEnabledTrue(): List<IndexedDirectory>
}
