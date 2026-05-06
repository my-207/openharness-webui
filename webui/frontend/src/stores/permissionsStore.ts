import { create } from 'zustand'

const API_BASE = '/api'

export interface PermissionsConfig {
  mode: string
  path_rules: string[]
  denied_commands: string[]
  allowed_tools: string[]
  disallowed_tools: string[]
}

interface PermissionsState {
  config: PermissionsConfig | null
  loading: boolean
  error: string | null

  fetchPermissions: () => Promise<void>
  updatePermissions: (data: Partial<PermissionsConfig>) => Promise<void>
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  config: null,
  loading: false,
  error: null,

  fetchPermissions: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/permissions`)
      if (!res.ok) throw new Error('Failed to fetch permissions')
      const config = await res.json()
      set({ config, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  updatePermissions: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update permissions')
      const config = await res.json()
      set({ config })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
