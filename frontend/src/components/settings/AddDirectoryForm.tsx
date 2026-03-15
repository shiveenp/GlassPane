import { useState, type FormEvent } from 'react'
import { FolderPlus, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  onAdd: (path: string) => void
  isAdding: boolean
  error: string | null
  onClearError: () => void
}

export default function AddDirectoryForm({ onAdd, isAdding, error, onClearError }: Props) {
  const [path, setPath] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = path.trim()
    if (!trimmed || isAdding) return
    onAdd(trimmed)
    setPath('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={path}
          onChange={(e) => {
            setPath(e.target.value)
            if (error) onClearError()
          }}
          placeholder="/Users/you/documents"
          className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:font-sans placeholder:text-gray-400"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !path.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FolderPlus className="w-4 h-4" />
          )}
          {isAdding ? 'Adding…' : 'Add Directory'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </form>
  )
}
