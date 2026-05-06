import { create } from 'zustand'

const API_BASE = '/api'

export interface Settings {
  theme: string
  effort_level: string
  output_style: string
  fast_mode: boolean
  vim_mode: boolean
  voice_mode: boolean
  debug_mode: boolean
  bare_mode: boolean
  max_turns: number
  auto_compact: boolean
  system_prompt: string
  verbose: boolean
}

interface SettingsState {
  settings: Settings | null
  loading: boolean
  error: string | null

  fetchSettings: () => Promise<void>
  updateSettings: (data: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/settings`)
      if (!res.ok) throw new Error('Failed to fetch settings')
      const settings = await res.json()
      set({ settings, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  updateSettings: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update settings')
      const settings = await res.json()
      set({ settings })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
