package io.shiveenp.glasspane.model

import java.time.Instant

data class StorageItem(
    val id: String,
    val name: String,
    val path: String,
    val itemType: StorageItemType,
    val provider: StorageProvider,
    val size: Long,
    val createdAt: Instant,
    val modifiedAt: Instant,
    val mimeType: String?,
)
