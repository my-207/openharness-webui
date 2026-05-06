import { create } from 'zustand'

const API_BASE = '/api'

export interface Teammate {
  name: string
  id: string
  status: string
  duration_seconds: number
  current_task: string
}

export interface SwarmNotif {
  time: string
  message: string
  type: string
}

interface SwarmState {
  teammates: Teammate[]
  notifications: SwarmNotif[]
  loading: boolean
  error: string | null

  fetchTeammates: () => Promise<void>
  createTeam: (data: Record<string, unknown>) => Promise<void>
  deleteTeam: (name: string) => Promise<void>
  fetchNotifications: () => Promise<void>
}

export const useSwarmStore = create<SwarmState>((set, get) => ({
  teammates: [],
  notifications: [],
  loading: false,
  error: null,

  fetchTeammates: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/swarm/teammates`)
      if (!res.ok) throw new Error('Failed to fetch teammates')
      const teammates = await res.json()
      set({ teammates, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createTeam: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/swarm/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create team')
      await get().fetchTeammates()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  deleteTeam: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/swarm/teams/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete team')
      await get().fetchTeammates()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/swarm/notifications`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const notifications = await res.json()
      set({ notifications, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
