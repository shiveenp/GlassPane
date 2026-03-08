package io.shiveenp.glasspane.repository.model

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("indexed_files")
data class IndexedFile(
    @Id
    val id: UUID? = null,
    @Column("path")
    val path: String,
    @Column("last_modified_at")
    val lastModifiedAt: Instant,
    @Column("indexed_at")
    val indexedAt: Instant = Instant.now(),
)
