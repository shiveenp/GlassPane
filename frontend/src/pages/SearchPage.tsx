import { useState, useRef, useCallback } from 'react'
import { SearchX, FolderSearch } from 'lucide-react'
import { searchStream } from '../api/search'
import type { SearchSource } from '../types'
import SearchBar from '../components/search/SearchBar'
import AnswerCard from '../components/search/AnswerCard'
import SourceCard from '../components/search/SourceCard'

type SearchStatus = 'idle' | 'searching' | 'streaming' | 'done' | 'error'

export default function SearchPage() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<SearchSource[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    setLastQuery(query)
    setAnswer('')
    setSources([])
    setErrorMsg('')
    setStatus('searching')

    try {
      for await (const evt of searchStream(query, abort.signal)) {
        if (evt.event === 'sources') {
          setSources(evt.sources)
          setStatus('streaming')
        } else if (evt.event === 'token') {
          setAnswer((prev) => prev + evt.token)
        } else if (evt.event === 'done') {
          setStatus('done')
        }
      }
      // Stream ended naturally without a 'done' event
      setStatus((s) => (s === 'streaming' ? 'done' : s))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setErrorMsg((err as Error).message || 'Search failed. Is the backend running?')
      setStatus('error')
    }
  }, [])

  const isSearching = status === 'searching' || status === 'streaming'
  const hasResults = sources.length > 0 || answer.length > 0
  const showEmpty = status === 'idle'

  return (
    <div className="h-full flex flex-col">
      {/* Search bar — sticky at top when results exist */}
      <div className={`${hasResults || status === 'searching' ? 'border-b border-gray-100 bg-white shadow-sm' : ''} px-8 py-5 transition-all`}>
        {showEmpty && (
          <div className="max-w-2xl mx-auto text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-3">
              <FolderSearch className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Search your files</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ask anything — GlassPane searches your indexed content and generates an answer
            </p>
          </div>
        )}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} isSearching={isSearching} autoFocus />
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Error state */}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <SearchX className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Search failed</p>
                <p className="mt-0.5 text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Searching — waiting for sources */}
          {status === 'searching' && (
            <div className="space-y-3">
              <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>
          )}

          {/* No results */}
          {status === 'done' && sources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <SearchX className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">No matching documents found</p>
              <p className="text-xs mt-1">
                Try indexing more directories in{' '}
                <a href="/settings" className="text-indigo-500 hover:underline">
                  Settings
                </a>
              </p>
            </div>
          )}

          {/* Answer — streams in after sources event */}
          {(status === 'streaming' || status === 'done') && answer && (
            <AnswerCard answer={answer} isStreaming={status === 'streaming'} />
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {sources.length} source{sources.length !== 1 ? 's' : ''} for &ldquo;{lastQuery}&rdquo;
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sources.map((source, i) => (
                  <SourceCard key={source.filePath + i} source={source} rank={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
