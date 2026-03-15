import { apiFetch } from './client'
import type { IndexedDirectory } from '../types'

const BASE = '/api/v1/index'

export const indexingApi = {
  listDirectories: (): Promise<IndexedDirectory[]> =>
    apiFetch(`${BASE}/directories`),

  addDirectory: (path: string): Promise<IndexedDirectory> =>
    apiFetch(`${BASE}/directories`, {
      method: 'POST',
      body: JSON.stringify({ path }),
    }),

  removeDirectory: (id: string): Promise<void> =>
    apiFetch(`${BASE}/directories/${id}`, {
      method: 'DELETE',
    }),

  setEnabled: (id: string, enabled: boolean): Promise<IndexedDirectory> =>
    apiFetch(`${BASE}/directories/${id}/enabled`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  triggerIndexing: (): Promise<void> =>
    apiFetch(`${BASE}/run`, { method: 'POST' }),

  triggerCleanup: (): Promise<void> =>
    apiFetch(`${BASE}/cleanup`, { method: 'POST' }),
}
