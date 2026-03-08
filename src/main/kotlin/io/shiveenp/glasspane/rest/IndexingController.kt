package io.shiveenp.glasspane.rest

import io.shiveenp.glasspane.model.IndexedDirectory
import io.shiveenp.glasspane.rest.request.AddDirectoryRequest
import io.shiveenp.glasspane.rest.request.SetDirectoryEnabledRequest
import io.shiveenp.glasspane.service.IndexingService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/index")
class IndexingController(
    private val indexingService: IndexingService,
) {

    @PostMapping("/run")
    fun triggerIndexing(): ResponseEntity<Unit> {
        indexingService.indexAll()
        return ResponseEntity.accepted().build()
    }

    @PostMapping("/cleanup")
    fun triggerCleanup(): ResponseEntity<Unit> {
        indexingService.cleanupOrphans()
        return ResponseEntity.accepted().build()
    }

    @GetMapping("/directories")
    fun listDirectories(): List<IndexedDirectory> =
        indexingService.listDirectories()

    @PostMapping("/directories")
    fun addDirectory(@RequestBody request: AddDirectoryRequest): ResponseEntity<Unit> {
        indexingService.addDirectory(request.path) ?: return ResponseEntity.badRequest().build()
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @DeleteMapping("/directories/{id}")
    fun removeDirectory(@PathVariable id: UUID): ResponseEntity<Unit> {
        if (!indexingService.removeDirectory(id)) return ResponseEntity.notFound().build()
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/directories/{id}/enabled")
    fun setEnabled(
        @PathVariable id: UUID,
        @RequestBody request: SetDirectoryEnabledRequest,
    ): ResponseEntity<IndexedDirectory> {
        val updated = indexingService.setDirectoryEnabled(id, request.enabled)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(updated)
    }
}
