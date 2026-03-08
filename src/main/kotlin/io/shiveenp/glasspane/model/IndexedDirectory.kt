package io.shiveenp.glasspane.model

import java.time.Instant
import java.util.UUID

data class IndexedDirectory(
    val id: UUID?,
    val path: String,
    val enabled: Boolean,
    val type: IndexedDirectoryType = IndexedDirectoryType.LOCAL,
    val lastIndexedAt: Instant?,
    val createdAt: Instant,
)
