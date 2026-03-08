package io.shiveenp.glasspane.service

import com.fasterxml.jackson.databind.ObjectMapper
import io.shiveenp.glasspane.model.SearchRequest
import io.shiveenp.glasspane.model.SearchResult
import io.shiveenp.glasspane.model.SearchSource
import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.document.Document
import org.springframework.ai.vectorstore.SearchRequest as VectorSearchRequest
import org.springframework.ai.vectorstore.VectorStore
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Service
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.reactive.asFlow

@Service
class SearchService(
    private val vectorStore: VectorStore,
    private val chatClient: ChatClient,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(SearchService::class.java)

    fun search(request: SearchRequest): SearchResult {
        val docs = retrieveDocs(request)
        if (docs.isEmpty()) {
            return SearchResult(answer = "No relevant documents found for your query.", sources = emptyList())
        }

        val answer = chatClient.prompt()
            .system(SYSTEM_PROMPT)
            .user(buildUserPrompt(request.query, docs))
            .call()
            .content() ?: "Unable to generate an answer."

        return SearchResult(answer = answer, sources = docs.toSources())
    }

    fun searchStream(request: SearchRequest): Flow<ServerSentEvent<String>> = flow {
        val docs = retrieveDocs(request)
        if (docs.isEmpty()) {
            emit(sse("done", "No relevant documents found for your query."))
            return@flow
        }

        emit(sse("sources", objectMapper.writeValueAsString(docs.toSources())))

        chatClient.prompt()
            .system(SYSTEM_PROMPT)
            .user(buildUserPrompt(request.query, docs))
            .stream()
            .content()
            .asFlow()
            .collect { token -> emit(sse("token", token)) }

        emit(sse("done", ""))
    }

    private fun retrieveDocs(request: SearchRequest): List<Document> {
        val docs = vectorStore.similaritySearch(
            VectorSearchRequest.builder()
                .query(request.query)
                .topK(request.limit)
                .similarityThreshold(SIMILARITY_THRESHOLD)
                .build()
        ) ?: emptyList()

        log.info("Found {} documents above threshold for query: {}", docs.size, request.query)
        docs.forEach { log.debug("  score={} file={}", it.score, it.metadata["fileName"]) }
        return docs
    }

    private fun buildUserPrompt(query: String, docs: List<Document>): String {
        val context = docs.joinToString("\n\n---\n\n") { it.text ?: "" }
        return """
            Question: $query

            Context:
            $context

            Answer based only on the context above:
        """.trimIndent()
    }

    private fun List<Document>.toSources() = map { doc ->
        SearchSource(
            filePath = doc.metadata["filePath"]?.toString() ?: "",
            fileName = doc.metadata["fileName"]?.toString() ?: "",
            snippet = doc.text?.take(200)?.trimEnd() ?: "",
            score = doc.score ?: 0.0,
        )
    }

    private fun sse(event: String, data: String) =
        ServerSentEvent.builder<String>().event(event).data(data).build()

    companion object {
        private const val SIMILARITY_THRESHOLD = 0.6

        private const val SYSTEM_PROMPT = """
            You are a helpful assistant that answers questions based strictly on the provided context.
            If the context does not contain enough information to answer the question, say so clearly.
            Do not make up information that is not present in the context.
            Keep your answers concise and directly relevant to the question.
            **Try to answer the question based on the provided context as best as possible.**
        """
    }
}
