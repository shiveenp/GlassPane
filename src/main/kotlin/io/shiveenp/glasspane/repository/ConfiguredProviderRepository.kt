package io.shiveenp.glasspane.repository

import io.shiveenp.glasspane.repository.model.ConfiguredProvider
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ConfiguredProviderRepository : CrudRepository<ConfiguredProvider, UUID> {

    @Query("SELECT * FROM configured_providers WHERE user_id = :userId and deactivated_at IS NOT NULL")
    fun findActiveProviders(
        @Param("userId") userId: String
    ): List<ConfiguredProvider>
}
