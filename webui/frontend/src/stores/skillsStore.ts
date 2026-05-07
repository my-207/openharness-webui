import { create } from 'zustand'

const API_BASE = '/api'

export interface Skill {
  name: string
  description: string
  content: string
  source: string
  enabled: boolean
  created_at: string
}

interface SkillsState {
  skills: Skill[]
  loading: boolean
  error: string | null

  fetchSkills: () => Promise<void>
  createSkill: (data: Partial<Skill>) => Promise<void>
  toggleSkill: (name: string) => Promise<void>
  deleteSkill: (name: string) => Promise<void>
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  loading: false,
  error: null,

  fetchSkills: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/skills`)
      if (!res.ok) throw new Error('Failed to fetch skills')
      const skills = await res.json()
      set({ skills, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createSkill: async (data) => {
    set({ error: null })
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text ? `Failed to create skill: ${text.slice(0, 200)}` : `Failed to create skill (HTTP ${res.status})`)
    }
    await get().fetchSkills()
  },

  toggleSkill: async (name) => {
    set({ error: null })
    const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(name)}/toggle`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to toggle skill')
    await get().fetchSkills()
  },

  deleteSkill: async (name) => {
    set({ error: null })
    const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete skill')
    await get().fetchSkills()
  },
}))
