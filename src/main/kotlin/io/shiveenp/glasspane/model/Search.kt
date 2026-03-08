package io.shiveenp.glasspane.model

data class SearchRequest(
    val query: String,
    val limit: Int = 10,
)

data class SearchResult(
    val answer: String,
    val sources: List<SearchSource>,
)

data class SearchSource(
    val filePath: String,
    val fileName: String,
    val snippet: String,
    val score: Double,
)
