import { create } from 'zustand'

const API_BASE = '/api'

export interface Task {
  id: string
  type: string
  status: string
  description: string
  metadata: Record<string, unknown>
  output: string
  created_at: string
}

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null

  fetchTasks: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<void>
  stopTask: (id: string) => Promise<void>
  getTask: (id: string) => Promise<Task | undefined>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const tasks = await res.json()
      set({ tasks, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createTask: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create task')
      await get().fetchTasks()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  stopTask: async (id) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to stop task')
      await get().fetchTasks()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  getTask: async (id) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`)
      if (!res.ok) throw new Error('Failed to get task')
      return await res.json()
    } catch (err) {
      set({ error: (err as Error).message })
      return undefined
    }
  },
}))
