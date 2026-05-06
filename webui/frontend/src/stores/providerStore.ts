import { create } from 'zustand'
import type { ProviderProfile, ConnectionTestResult } from '../types/protocol'

const API_BASE = '/api'

interface ProviderState {
  profiles: ProviderProfile[]
  loading: boolean
  error: string | null

  // Actions
  fetchProfiles: () => Promise<void>
  createProfile: (data: Partial<ProviderProfile>) => Promise<void>
  updateProfile: (name: string, data: Partial<ProviderProfile>) => Promise<void>
  deleteProfile: (name: string) => Promise<void>
  switchProfile: (name: string) => Promise<void>
  testConnection: (name: string) => Promise<ConnectionTestResult>
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  profiles: [],
  loading: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/providers`)
      if (!res.ok) throw new Error('Failed to fetch providers')
      const profiles = await res.json()
      set({ profiles, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  createProfile: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create provider')
      await get().fetchProfiles()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  updateProfile: async (name, data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/providers/${name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update provider')
      await get().fetchProfiles()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  deleteProfile: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/providers/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete provider')
      await get().fetchProfiles()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  switchProfile: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/providers/${name}/use`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to switch provider')
      await get().fetchProfiles()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  testConnection: async (name) => {
    const res = await fetch(`${API_BASE}/providers/${name}/test`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail || 'Failed to test connection')
    }
    return res.json()
  },
}))
