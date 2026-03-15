export type DirectoryType = 'LOCAL' | 'REMOTE'

export interface IndexedDirectory {
  id: string
  path: string
  enabled: boolean
  type: DirectoryType
  lastIndexedAt: string | null
  createdAt: string
}

export interface SearchSource {
  filePath: string
  fileName: string
  snippet: string
  score: number
}

export interface SearchResult {
  answer: string
  sources: SearchSource[]
}
