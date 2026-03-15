import { Loader2, FolderOpen } from 'lucide-react'
import type { IndexedDirectory } from '../../types'
import DirectoryRow from './DirectoryRow'

interface Props {
  directories: IndexedDirectory[]
  isLoading: boolean
  error: string | null
  onRemove: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
  removingId: string | null
}

export default function DirectoryList({
  directories,
  isLoading,
  error,
  onRemove,
  onToggle,
  removingId,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-14 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2.5" />
        <span className="text-sm">Loading directories…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-14 text-center text-sm text-red-500">
        Failed to load directories: {error}
      </div>
    )
  }

  if (directories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-gray-400">
        <FolderOpen className="w-8 h-8 mb-3" />
        <p className="text-sm font-medium">No directories added yet</p>
        <p className="text-xs mt-1">Add a local directory above to start indexing its contents</p>
      </div>
    )
  }

  return (
    <div>
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <span>Path</span>
        <span className="px-8">Indexing</span>
        <span className="px-8">Last Indexed</span>
        <span className="w-8" />
      </div>

      {directories.map((dir) => (
        <DirectoryRow
          key={dir.id}
          directory={dir}
          onRemove={onRemove}
          onToggle={onToggle}
          isRemoving={removingId === dir.id}
        />
      ))}
    </div>
  )
}
