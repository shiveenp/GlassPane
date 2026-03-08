package io.shiveenp.glasspane.repository

import io.shiveenp.glasspane.repository.model.IndexedFile
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import java.util.UUID

interface IndexedFileRepository : CrudRepository<IndexedFile, UUID> {

    @Query("SELECT * FROM indexed_files WHERE path = :path")
    fun findByPath(@Param("path") path: String): IndexedFile?
}
