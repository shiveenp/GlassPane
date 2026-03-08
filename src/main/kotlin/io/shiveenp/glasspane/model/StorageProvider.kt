package io.shiveenp.glasspane.model

import java.util.Locale
import java.util.Locale.getDefault

// Represents different storage providers
enum class StorageProvider {
    DROPBOX,
    GOOGLE_DRIVE,
    ONE_DRIVE,
    SFTP,
    LOCAL;

    fun displayName(): String = name.split("_")
        .joinToString(" ") {
            it.lowercase().replaceFirstChar { if (it.isLowerCase()) it.titlecase(getDefault()) else it.toString() }
        }
}

