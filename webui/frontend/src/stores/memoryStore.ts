import { create } from 'zustand'

const API_BASE = '/api'

export interface MemEntry {
  id: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

interface MemoryState {
  entries: MemEntry[]
  searchResults: MemEntry[]
  loading: boolean
  error: string | null

  fetchEntries: () => Promise<void>
  createEntry: (data: Partial<MemEntry>) => Promise<void>
  updateEntry: (id: string, data: Partial<MemEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  searchEntries: (query: string) => Promise<void>
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  entries: [],
  searchResults: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/memory`)
      if (!res.ok) throw new Error('Failed to fetch memory entries')
      const entries = await res.json()
      set({ entries, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createEntry: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create memory entry')
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  updateEntry: async (id, data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/memory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update memory entry')
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  deleteEntry: async (id) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/memory/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete memory entry')
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  searchEntries: async (query) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/memory/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed to search memory entries')
      const searchResults = await res.json()
      set({ searchResults, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
