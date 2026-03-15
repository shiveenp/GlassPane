import { ApiError } from './client'
import type { SearchSource } from '../types'

export type SearchSseEvent =
  | { event: 'sources'; sources: SearchSource[] }
  | { event: 'token'; token: string }
  | { event: 'done' }

/**
 * Consumes the /api/v1/search/stream SSE endpoint and yields typed events.
 * The server emits:
 *   event: sources  — JSON-encoded SearchSource[] (arrives before LLM starts)
 *   event: token    — individual LLM answer tokens
 *   event: done     — signals stream completion
 */
export async function* searchStream(
  query: string,
  signal?: AbortSignal,
): AsyncGenerator<SearchSseEvent> {
  const res = await fetch('/api/v1/search/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 10 }),
    signal,
  })

  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => res.statusText))
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = 'message'
  let currentData = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        currentData = line.slice(5).trim()
      } else if (line === '') {
        // Blank line = dispatch the buffered event
        if (currentEvent === 'sources') {
          yield { event: 'sources', sources: JSON.parse(currentData) as SearchSource[] }
        } else if (currentEvent === 'token' && currentData) {
          yield { event: 'token', token: currentData }
        } else if (currentEvent === 'done') {
          yield { event: 'done' }
        }
        currentEvent = 'message'
        currentData = ''
      }
    }
  }
}
