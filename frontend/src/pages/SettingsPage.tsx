import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import { indexingApi } from '../api/indexing'
import AddDirectoryForm from '../components/settings/AddDirectoryForm'
import DirectoryList from '../components/settings/DirectoryList'

type IndexStatus = 'idle' | 'running' | 'done'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [indexStatus, setIndexStatus] = useState<IndexStatus>('idle')

  const { data: directories = [], isLoading, error } = useQuery({
    queryKey: ['directories'],
    queryFn: indexingApi.listDirectories,
  })

  const addMutation = useMutation({
    mutationFn: indexingApi.addDirectory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directories'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: indexingApi.removeDirectory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['directories'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      indexingApi.setEnabled(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['directories'] }),
  })

  const handleRunIndex = async () => {
    setIndexStatus('running')
    try {
      await indexingApi.triggerIndexing()
      setIndexStatus('done')
      // Refresh so lastIndexedAt timestamps update
      queryClient.invalidateQueries({ queryKey: ['directories'] })
      setTimeout(() => setIndexStatus('idle'), 3000)
    } catch {
      setIndexStatus('idle')
    }
  }

  const handleCleanup = async () => {
    await indexingApi.triggerCleanup()
  }

  const removingId = removeMutation.isPending ? (removeMutation.variables as string) : null

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage which local directories are indexed for search
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCleanup}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Remove orphaned index entries for deleted files"
          >
            <RefreshCw className="w-4 h-4" />
            Cleanup
          </button>

          <button
            onClick={handleRunIndex}
            disabled={indexStatus === 'running'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-w-[130px] justify-center"
          >
            {indexStatus === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
            {indexStatus === 'done' && <CheckCircle2 className="w-4 h-4" />}
            {indexStatus === 'idle' && <Play className="w-4 h-4" />}
            {indexStatus === 'running' ? 'Indexing…' : indexStatus === 'done' ? 'Done!' : 'Run Indexing'}
          </button>
        </div>
      </div>

      {/* Directories card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Indexed Directories</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {directories.length === 0
                ? 'No directories configured'
                : `${directories.filter((d) => d.enabled).length} of ${directories.length} active`}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-gray-100">
          <AddDirectoryForm
            onAdd={(path) => addMutation.mutate(path)}
            isAdding={addMutation.isPending}
            error={addMutation.error?.message ?? null}
            onClearError={() => addMutation.reset()}
          />
        </div>

        <DirectoryList
          directories={directories}
          isLoading={isLoading}
          error={error?.message ?? null}
          onRemove={(id) => removeMutation.mutate(id)}
          onToggle={(id, enabled) => toggleMutation.mutate({ id, enabled })}
          removingId={removingId}
        />
      </div>
    </div>
  )
}
