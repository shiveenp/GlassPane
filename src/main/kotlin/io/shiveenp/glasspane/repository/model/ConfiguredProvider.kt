package io.shiveenp.glasspane.repository.model

import io.shiveenp.glasspane.model.StorageProvider
import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("configured_providers")
data class ConfiguredProvider(
    @Id
    val id: UUID,
    @Column("user_id")
    val userId: String,
    @Column("provider")
    val provider: StorageProvider,
    @Column("deactivated_at")
    val deactivatedAt: Instant? = null
)
