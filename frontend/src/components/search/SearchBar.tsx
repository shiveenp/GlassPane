import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface Props {
  onSearch: (query: string) => void
  isSearching: boolean
  autoFocus?: boolean
  initialQuery?: string
}

export default function SearchBar({ onSearch, isSearching, autoFocus, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)

  const submit = () => {
    const q = query.trim()
    if (q && !isSearching) onSearch(q)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400 pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search your files…"
          autoFocus={autoFocus}
          disabled={isSearching}
          className="w-full pl-12 pr-12 py-3.5 text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:bg-gray-50 transition-shadow"
        />

        {query && !isSearching && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
