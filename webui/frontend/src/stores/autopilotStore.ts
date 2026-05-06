import { create } from 'zustand'

const API_BASE = '/api'

export interface AutopilotStatus {
  active: boolean
  scanned_files: number
  entries_count: number
  last_scan: string | null
}

export interface AutopilotEntry {
  path: string
  context: string
  priority: string
  status: string
  created_at: string
}

interface AutopilotState {
  dashboard: AutopilotStatus | null
  entries: AutopilotEntry[]
  loading: boolean
  error: string | null

  fetchStatus: () => Promise<void>
  fetchEntries: () => Promise<void>
  addEntry: (data: Partial<AutopilotEntry>) => Promise<void>
  triggerScan: () => Promise<void>
  runNext: () => Promise<void>
  exportDashboard: () => Promise<void>
}

export const useAutopilotStore = create<AutopilotState>((set, get) => ({
  dashboard: null,
  entries: [],
  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/status`)
      if (!res.ok) throw new Error('Failed to fetch autopilot status')
      const dashboard = await res.json()
      set({ dashboard, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  fetchEntries: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/entries`)
      if (!res.ok) throw new Error('Failed to fetch autopilot entries')
      const entries = await res.json()
      set({ entries, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  addEntry: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add autopilot entry')
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  triggerScan: async () => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/scan`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to trigger scan')
      await get().fetchStatus()
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  runNext: async () => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/run-next`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to run next entry')
      await get().fetchStatus()
      await get().fetchEntries()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  exportDashboard: async () => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/autopilot/export`)
      if (!res.ok) throw new Error('Failed to export dashboard')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'autopilot-dashboard.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
