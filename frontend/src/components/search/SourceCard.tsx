import { FileText, Code2, File } from 'lucide-react'
import type { SearchSource } from '../../types'

interface Props {
  source: SearchSource
  rank: number
}

const CODE_EXTENSIONS = new Set([
  'kt', 'java', 'py', 'js', 'ts', 'tsx', 'jsx', 'go', 'rs', 'rb', 'cs',
  'cpp', 'c', 'h', 'swift', 'sh', 'json', 'yaml', 'yml', 'toml', 'xml',
])

const DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'rst', 'adoc'])

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (CODE_EXTENSIONS.has(ext)) return <Code2 className="w-4 h-4 text-violet-500" />
  if (DOC_EXTENSIONS.has(ext)) return <FileText className="w-4 h-4 text-blue-500" />
  return <File className="w-4 h-4 text-gray-400" />
}

function scoreLabel(score: number): { label: string; className: string } {
  const pct = Math.round(score * 100)
  if (pct >= 80) return { label: `${pct}%`, className: 'bg-green-50 text-green-700' }
  if (pct >= 70) return { label: `${pct}%`, className: 'bg-blue-50 text-blue-700' }
  return { label: `${pct}%`, className: 'bg-gray-100 text-gray-500' }
}

export default function SourceCard({ source, rank }: Props) {
  const { label, className } = scoreLabel(source.score)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(source.fileName)}
          <span className="text-sm font-semibold text-gray-800 truncate" title={source.fileName}>
            {source.fileName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400">#{rank}</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${className}`}>
            {label}
          </span>
        </div>
      </div>

      <p
        className="text-xs text-gray-400 font-mono truncate mb-2"
        title={source.filePath}
      >
        {source.filePath}
      </p>

      {source.snippet && (
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 italic border-l-2 border-gray-200 pl-2">
          {source.snippet}
        </p>
      )}
    </div>
  )
}
