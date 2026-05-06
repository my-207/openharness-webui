import { create } from 'zustand'

const API_BASE = '/api'

export interface CronJob {
  name: string
  schedule: string
  command: string
  status: string
  last_run: string | null
  next_run: string | null
  history: string[]
}

interface CronState {
  schedulerActive: boolean
  jobs: CronJob[]
  loading: boolean
  error: string | null

  fetchSchedulerStatus: () => Promise<void>
  toggleScheduler: () => Promise<void>
  fetchJobs: () => Promise<void>
  createJob: (data: Partial<CronJob>) => Promise<void>
  deleteJob: (name: string) => Promise<void>
  toggleJob: (name: string) => Promise<void>
  fetchJobHistory: (name: string) => Promise<string[]>
}

export const useCronStore = create<CronState>((set, get) => ({
  schedulerActive: false,
  jobs: [],
  loading: false,
  error: null,

  fetchSchedulerStatus: async () => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/status`)
      if (!res.ok) throw new Error('Failed to fetch scheduler status')
      const data = await res.json()
      set({ schedulerActive: data.active ?? false })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  toggleScheduler: async () => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/toggle`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle scheduler')
      await get().fetchSchedulerStatus()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  fetchJobs: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/jobs`)
      if (!res.ok) throw new Error('Failed to fetch cron jobs')
      const jobs = await res.json()
      set({ jobs, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createJob: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create cron job')
      await get().fetchJobs()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  deleteJob: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/jobs/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete cron job')
      await get().fetchJobs()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  toggleJob: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/jobs/${name}/toggle`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle cron job')
      await get().fetchJobs()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  fetchJobHistory: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/cron/jobs/${name}/history`)
      if (!res.ok) throw new Error('Failed to fetch job history')
      return await res.json()
    } catch (err) {
      set({ error: (err as Error).message })
      return []
    }
  },
}))
