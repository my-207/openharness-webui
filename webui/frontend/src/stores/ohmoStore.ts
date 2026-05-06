import { create } from 'zustand'

interface Channel {
  platform: string
  enabled: boolean
  config: Record<string, unknown>
}

interface GatewayStatus {
  status: string
  pid: number | null
  uptime: string | null
}

interface Workspace {
  path: string
  file_count: number
  files: string[]
}

interface OhmoState {
  workspace: Workspace | null
  gateway: GatewayStatus | null
  channels: Channel[]
  loading: boolean
  fetchWorkspace: () => Promise<void>
  fetchGatewayStatus: () => Promise<void>
  startGateway: () => Promise<void>
  stopGateway: () => Promise<void>
  restartGateway: () => Promise<void>
  fetchChannels: () => Promise<void>
  updateChannels: (channels: Channel[]) => Promise<void>
}

export const useOhmoStore = create<OhmoState>((set) => ({
  workspace: null,
  gateway: null,
  channels: [],
  loading: false,

  fetchWorkspace: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/ohmo/workspace')
      const data = await res.json()
      set({ workspace: data })
    } catch (err) {
      console.error('Failed to fetch workspace:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchGatewayStatus: async () => {
    try {
      const res = await fetch('/api/ohmo/gateway')
      const data = await res.json()
      set({ gateway: data })
    } catch (err) {
      console.error('Failed to fetch gateway status:', err)
    }
  },

  startGateway: async () => {
    try {
      const res = await fetch('/api/ohmo/gateway/start', { method: 'POST' })
      const data = await res.json()
      set({ gateway: data })
    } catch (err) {
      console.error('Failed to start gateway:', err)
    }
  },

  stopGateway: async () => {
    try {
      const res = await fetch('/api/ohmo/gateway/stop', { method: 'POST' })
      const data = await res.json()
      set({ gateway: data })
    } catch (err) {
      console.error('Failed to stop gateway:', err)
    }
  },

  restartGateway: async () => {
    try {
      const res = await fetch('/api/ohmo/gateway/restart', { method: 'POST' })
      const data = await res.json()
      set({ gateway: data })
    } catch (err) {
      console.error('Failed to restart gateway:', err)
    }
  },

  fetchChannels: async () => {
    try {
      const res = await fetch('/api/ohmo/channels')
      const data = await res.json()
      set({ channels: data.channels ?? data })
    } catch (err) {
      console.error('Failed to fetch channels:', err)
    }
  },

  updateChannels: async (channels: Channel[]) => {
    try {
      const res = await fetch('/api/ohmo/channels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channels),
      })
      const data = await res.json()
      set({ channels: data.channels ?? data })
    } catch (err) {
      console.error('Failed to update channels:', err)
    }
  },
}))
