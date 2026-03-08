package io.shiveenp.glasspane.storage

import io.shiveenp.glasspane.model.StorageItem

interface StorageAdapter {
    fun getStorageItems(): List<StorageItem>
}
