import { create } from 'zustand'

interface AuthSource {
  name: string
  type: string
  status: string
  info: string
}

interface ProviderAuthStatus {
  name: string
  configured: boolean
  auth_source: string
}

interface AuthState {
  sources: AuthSource[]
  providerStatus: ProviderAuthStatus[]
  loading: boolean
  fetchSources: () => Promise<void>
  fetchProviderStatus: () => Promise<void>
  logoutProvider: (provider: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  sources: [],
  providerStatus: [],
  loading: false,

  fetchSources: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth/sources')
      const data = await res.json()
      set({ sources: data.sources ?? data })
    } catch (err) {
      console.error('Failed to fetch auth sources:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchProviderStatus: async () => {
    try {
      const res = await fetch('/api/auth/providers')
      const data = await res.json()
      set({ providerStatus: data.providers ?? data })
    } catch (err) {
      console.error('Failed to fetch provider auth status:', err)
    }
  },

  logoutProvider: async (provider: string) => {
    try {
      await fetch(`/api/auth/${provider}/logout`, { method: 'POST' })
      set((s) => ({
        providerStatus: s.providerStatus.map((p) =>
          p.name === provider ? { ...p, configured: false } : p
        ),
      }))
    } catch (err) {
      console.error('Failed to logout provider:', err)
    }
  },
}))
