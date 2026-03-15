import { Trash2, Loader2 } from 'lucide-react'
import type { IndexedDirectory } from '../../types'

interface Props {
  directory: IndexedDirectory
  onRemove: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
  isRemoving: boolean
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DirectoryRow({ directory, onRemove, onToggle, isRemoving }: Props) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
      {/* Path */}
      <div className="min-w-0 pr-4">
        <p
          className="text-sm text-gray-800 font-mono truncate"
          title={directory.path}
        >
          {directory.path}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {directory.type === 'LOCAL' ? 'Local filesystem' : 'Remote'}
        </p>
      </div>

      {/* Enable toggle */}
      <div className="px-8">
        <button
          onClick={() => onToggle(directory.id, !directory.enabled)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
            directory.enabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          aria-label={directory.enabled ? 'Disable indexing' : 'Enable indexing'}
          title={directory.enabled ? 'Disable indexing' : 'Enable indexing'}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              directory.enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Last indexed */}
      <div className="px-8 text-right">
        <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
          {formatRelativeTime(directory.lastIndexedAt)}
        </span>
      </div>

      {/* Delete */}
      <div>
        <button
          onClick={() => onRemove(directory.id)}
          disabled={isRemoving}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
          aria-label="Remove directory"
          title="Remove directory"
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
