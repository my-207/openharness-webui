import { create } from 'zustand'
import type { TranscriptItem } from '../types/protocol'

const API_BASE = '/api'

export interface Session {
  id: string
  name: string
  model: string
  provider: string
  created_at: string
  message_count: number
  summary: string
  transcript?: TranscriptItem[]
}

interface SessionsState {
  sessions: Session[]
  loading: boolean
  error: string | null

  fetchSessions: () => Promise<void>
  createSession: (data: Partial<Session>) => Promise<Session | null>
  updateSession: (id: string, data: Partial<Session>) => Promise<Session | null>
  deleteSession: (id: string) => Promise<void>
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/sessions`)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const sessions = await res.json()
      set({ sessions, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createSession: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create session')
      const result = await res.json()
      await get().fetchSessions()
      return result.session ?? null
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    }
  },

  updateSession: async (id, data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update session')
      const result = await res.json()
      await get().fetchSessions()
      return result.session ?? null
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    }
  },

  deleteSession: async (id) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete session')
      await get().fetchSessions()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
