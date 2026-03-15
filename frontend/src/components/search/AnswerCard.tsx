import { Sparkles } from 'lucide-react'

interface Props {
  answer: string
  isStreaming: boolean
}

export default function AnswerCard({ answer, isStreaming }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-gray-700">Answer</span>
        {isStreaming && (
          <span className="ml-auto text-xs text-indigo-400 animate-pulse">Generating…</span>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {answer}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  )
}
