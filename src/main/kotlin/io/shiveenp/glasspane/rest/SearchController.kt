package io.shiveenp.glasspane.rest

import io.shiveenp.glasspane.model.SearchRequest
import io.shiveenp.glasspane.model.SearchResult
import io.shiveenp.glasspane.service.SearchService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow
import org.springframework.http.codec.ServerSentEvent
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/search")
class SearchController(
    private val searchService: SearchService,
) {

    @PostMapping
    fun search(@RequestBody request: SearchRequest): ResponseEntity<SearchResult> {
        if (request.query.isBlank()) return ResponseEntity.badRequest().build()
        return ResponseEntity.ok(searchService.search(request))
    }

    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun searchStream(@RequestBody request: SearchRequest): Flow<ServerSentEvent<String>> {
        if (request.query.isBlank()) return emptyFlow()
        return searchService.searchStream(request)
    }
}
