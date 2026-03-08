package io.shiveenp.glasspane.repository.model

import io.shiveenp.glasspane.model.IndexedDirectory as IndexedDirectoryDomain
import io.shiveenp.glasspane.model.IndexedDirectoryType
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("indexed_directories")
data class IndexedDirectory(
    @Id
    val id: UUID? = null,
    @Column("path")
    val path: String,
    @Column("enabled")
    val enabled: Boolean = true,
    @Column("last_indexed_at")
    val lastIndexedAt: Instant? = null,
    @Column("created_at")
    val createdAt: Instant = Instant.now(),
) {
    fun toDomain() = IndexedDirectoryDomain(
        id = id,
        path = path,
        enabled = enabled,
        type = IndexedDirectoryType.LOCAL,
        lastIndexedAt = lastIndexedAt,
        createdAt = createdAt,
    )
}
