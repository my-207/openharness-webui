import { create } from 'zustand'

const API_BASE = '/api'

export interface Plugin {
  name: string
  version: string
  description: string
  enabled: boolean
  source: string
  commands: string[]
  hooks: string[]
}

interface PluginsState {
  plugins: Plugin[]
  loading: boolean
  error: string | null

  fetchPlugins: () => Promise<void>
  installPlugin: (data: Partial<Plugin>) => Promise<void>
  uninstallPlugin: (name: string) => Promise<void>
  togglePlugin: (name: string) => Promise<void>
}

export const usePluginsStore = create<PluginsState>((set, get) => ({
  plugins: [],
  loading: false,
  error: null,

  fetchPlugins: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/plugins`)
      if (!res.ok) throw new Error('Failed to fetch plugins')
      const plugins = await res.json()
      set({ plugins, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  installPlugin: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/plugins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to install plugin')
      await get().fetchPlugins()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  uninstallPlugin: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/plugins/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to uninstall plugin')
      await get().fetchPlugins()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  togglePlugin: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/plugins/${name}/toggle`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle plugin')
      await get().fetchPlugins()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
