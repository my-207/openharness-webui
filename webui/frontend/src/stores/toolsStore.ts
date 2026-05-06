import { create } from 'zustand'

const API_BASE = '/api'

export interface ToolInfo {
  name: string
  description: string
  category: string
  required_args: string[]
  optional_args: string[]
}

export interface McpServer {
  name: string
  transport: string
  command: string
  url: string
  args: string[]
  status: string
  tools_count: number
  resources_count: number
}

interface ToolsState {
  tools: ToolInfo[]
  mcpServers: McpServer[]
  loading: boolean
  error: string | null

  fetchTools: () => Promise<void>
  fetchMcpServers: () => Promise<void>
  addMcpServer: (data: Partial<McpServer>) => Promise<void>
  removeMcpServer: (name: string) => Promise<void>
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  tools: [],
  mcpServers: [],
  loading: false,
  error: null,

  fetchTools: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools`)
      if (!res.ok) throw new Error('Failed to fetch tools')
      const tools = await res.json()
      set({ tools, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  fetchMcpServers: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/tools/mcp-servers`)
      if (!res.ok) throw new Error('Failed to fetch MCP servers')
      const mcpServers = await res.json()
      set({ mcpServers, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  addMcpServer: async (data) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/tools/mcp-servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add MCP server')
      await get().fetchMcpServers()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  removeMcpServer: async (name) => {
    set({ error: null })
    try {
      const res = await fetch(`${API_BASE}/tools/mcp-servers/${name}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove MCP server')
      await get().fetchMcpServers()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },
}))
