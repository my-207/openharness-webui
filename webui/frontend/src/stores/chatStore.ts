import { create } from 'zustand'
import type { TranscriptItem, TaskSnapshot, McpServerSnapshot, BridgeSessionSnapshot, SwarmTeammate, SwarmNotification, BackendEvent } from '../types/protocol'

interface SelectRequest {
  title: string
  command: string
  options: { value: string; label: string; description?: string; active?: boolean }[]
}

interface ChatState {
  // Connection
  ws: WebSocket | null
  connected: boolean

  // Conversation
  transcript: TranscriptItem[]
  assistantBuffer: string
  busy: boolean
  busyLabel: string | undefined
  ready: boolean
  currentSessionId: string | null

  // Status
  status: Record<string, unknown>
  tasks: TaskSnapshot[]
  commands: string[]
  mcpServers: McpServerSnapshot[]
  bridgeSessions: BridgeSessionSnapshot[]

  // Modals
  modal: Record<string, unknown> | null
  selectRequest: SelectRequest | null

  // Panels
  todoMarkdown: string
  swarmTeammates: SwarmTeammate[]
  swarmNotifications: SwarmNotification[]

  // Actions
  connect: (url: string) => void
  disconnect: () => void
  sendRequest: (payload: Record<string, unknown>) => boolean
  setModal: (modal: Record<string, unknown> | null) => void
  setSelectRequest: (req: SelectRequest | null) => void
  setBusy: (busy: boolean) => void
  setBusyLabel: (label: string | undefined) => void
  clearTranscript: () => void
  newSession: () => Promise<string | null>
  setCurrentSessionId: (id: string | null) => void
  restoreTranscript: (items: TranscriptItem[]) => void

  // Internal
  _handleEvent: (event: BackendEvent) => void
}

const flushMs = 50
const busyTimeoutMs = 30_000  // reset busy if no response after 30s
let assistantTimer: ReturnType<typeof setTimeout> | null = null
let transcriptTimer: ReturnType<typeof setTimeout> | null = null
let busyTimer: ReturnType<typeof setTimeout> | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
let pendingAssistant = ''
let pendingTranscript: TranscriptItem[] = []

// Helper: extract last user question from transcript for session naming
function _lastUserQuestion(items: TranscriptItem[]): string {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].role === 'user') {
      const text = items[i].text?.trim() ?? ''
      return text.length > 50 ? text.slice(0, 47) + '...' : text
    }
  }
  return ''
}

// Debounced auto-save of transcript to current session
async function _autoSaveTranscript(sessionId: string | null, items: TranscriptItem[]) {
  if (!sessionId || items.length === 0) return
  const name = _lastUserQuestion(items)
  try {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: items, message_count: items.length, ...(name ? { name } : {}) }),
    })
  } catch { /* silent save failure */ }
}

export const useChatStore = create<ChatState>((set, get) => ({
  ws: null,
  connected: false,

  transcript: [],
  assistantBuffer: '',
  busy: false,
  busyLabel: undefined,
  ready: false,
  currentSessionId: null,

  status: {},
  tasks: [],
  commands: [],
  mcpServers: [],
  bridgeSessions: [],

  modal: null,
  selectRequest: null,

  todoMarkdown: '',
  swarmTeammates: [],
  swarmNotifications: [],

  connect: (url: string) => {
    const existing = get().ws
    if (existing) existing.close()
    if (busyTimer) { clearTimeout(busyTimer); busyTimer = null }

    const ws = new WebSocket(url)
    ws.onopen = () => {
      // Only claim connected if this ws is still the active one
      if (get().ws === ws) set({ connected: true })
    }
    ws.onclose = () => {
      // Only reset state if this ws is still the active one
      // This prevents stale callbacks from old WebSocket instances
      // (e.g. React StrictMode double-invoke or rapid reconnects)
      // from corrupting the connection state.
      if (get().ws === ws) {
        set({ connected: false, ready: false, ws: null, busy: false })
      }
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BackendEvent
        get()._handleEvent(data)
      } catch (err) {
        console.warn('[WS] parse error:', err)
      }
    }
    ws.onerror = () => {
      // Auto-reconnect after 3s if still not connected
      setTimeout(() => {
        if (!get().connected) get().connect(url)
      }, 3000)
    }
    set({ ws })
  },

  disconnect: () => {
    const ws = get().ws
    if (ws) ws.close()
    set({ ws: null, connected: false, ready: false })
  },

  sendRequest: (payload: Record<string, unknown>) => {
    const ws = get().ws
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
      return true
    }
    console.warn('[WS] sendRequest failed: ws not OPEN (state=%s)', ws?.readyState)
    return false
  },

  setModal: (modal) => set({ modal }),
  setSelectRequest: (req) => set({ selectRequest: req }),
  setBusy: (busy) => {
    if (busyTimer) { clearTimeout(busyTimer); busyTimer = null }
    if (busy) {
      // Safety timeout: reset busy after busyTimeoutMs if no line_complete arrives
      busyTimer = setTimeout(() => {
        busyTimer = null
        set({ busy: false, busyLabel: undefined })
      }, busyTimeoutMs)
    }
    set({ busy })
  },
  setBusyLabel: (label) => set({ busyLabel: label }),
  clearTranscript: () => {
    pendingTranscript = []
    pendingAssistant = ''
    set({ transcript: [], assistantBuffer: '' })
  },

  newSession: async () => {
    // Save current transcript to existing session before clearing
    const { transcript, currentSessionId } = get()
    if (currentSessionId && transcript.length > 0) {
      const name = _lastUserQuestion(transcript)
      try {
        await fetch(`/api/sessions/${currentSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript,
            message_count: transcript.length,
            ...(name ? { name } : {}),
          }),
        })
      } catch { /* silent */ }
    }

    // Clear local state
    pendingTranscript = []
    pendingAssistant = ''
    set({ transcript: [], assistantBuffer: '', currentSessionId: null })

    // Create new session in backend
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Session', model: '', provider: '' }),
      })
      const result = await res.json()
      const sid = result.session?.id ?? null
      set({ currentSessionId: sid })
      return sid
    } catch {
      return null
    }
  },

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  restoreTranscript: (items) => {
    pendingTranscript = []
    pendingAssistant = ''
    set({ transcript: items, assistantBuffer: '' })
  },

  // ─── Internal event handler ───
  _handleEvent: (event: BackendEvent) => {
    switch (event.type) {
      case 'ready': {
        set({
          ready: true,
          status: (event.state ?? {}) as Record<string, unknown>,
          tasks: (event.tasks ?? []) as TaskSnapshot[],
          commands: (event.commands ?? []),
          mcpServers: (event.mcp_servers ?? []) as McpServerSnapshot[],
          bridgeSessions: (event.bridge_sessions ?? []) as BridgeSessionSnapshot[],
        })
        break
      }

      case 'state_snapshot': {
        if (event.state) set({ status: event.state as Record<string, unknown> })
        if (event.mcp_servers) set({ mcpServers: event.mcp_servers as McpServerSnapshot[] })
        if (event.bridge_sessions) set({ bridgeSessions: event.bridge_sessions as BridgeSessionSnapshot[] })
        break
      }

      case 'tasks_snapshot': {
        if (event.tasks) set({ tasks: event.tasks as TaskSnapshot[] })
        break
      }

      case 'transcript_item': {
        if (event.item) {
          pendingTranscript.push(event.item as TranscriptItem)
          if (!transcriptTimer) {
            transcriptTimer = setTimeout(() => {
              transcriptTimer = null
              const items = pendingTranscript.splice(0)
              if (items.length > 0) {
                set((s) => ({ transcript: [...s.transcript, ...items] }))
              }
            }, flushMs)
          }
        }
        break
      }

      case 'assistant_delta': {
        if (event.message) {
          pendingAssistant += event.message
          if (assistantTimer) clearTimeout(assistantTimer)
          assistantTimer = setTimeout(() => {
            assistantTimer = null
            set({ assistantBuffer: pendingAssistant })
          }, flushMs)
        }
        break
      }

      case 'assistant_complete': {
        if (assistantTimer) { clearTimeout(assistantTimer); assistantTimer = null }
        if (transcriptTimer) { clearTimeout(transcriptTimer); transcriptTimer = null }
        // Flush pending transcript items
        const items = pendingTranscript.splice(0)
        if (event.item) items.push(event.item as TranscriptItem)
        if (items.length > 0) {
          set((s) => ({ transcript: [...s.transcript, ...items], assistantBuffer: '' }))
        } else {
          set({ assistantBuffer: '' })
        }
        break
      }

      case 'tool_started': {
        set({ busy: true, busyLabel: `Running ${event.tool_name ?? 'tool'}...` })
        if (event.item) {
          pendingTranscript.push(event.item as TranscriptItem)
          if (!transcriptTimer) {
            transcriptTimer = setTimeout(() => {
              transcriptTimer = null
              const items = pendingTranscript.splice(0)
              if (items.length > 0) set((s) => ({ transcript: [...s.transcript, ...items] }))
            }, flushMs)
          }
        }
        break
      }

      case 'tool_completed': {
        set({ busyLabel: 'Processing...' })
        if (event.item) {
          pendingTranscript.push(event.item as TranscriptItem)
          if (!transcriptTimer) {
            transcriptTimer = setTimeout(() => {
              transcriptTimer = null
              const items = pendingTranscript.splice(0)
              if (items.length > 0) set((s) => ({ transcript: [...s.transcript, ...items] }))
            }, flushMs)
          }
        }
        break
      }

      case 'line_complete': {
        if (busyTimer) { clearTimeout(busyTimer); busyTimer = null }
        const { currentSessionId, transcript } = get()
        set({ busy: false, busyLabel: undefined })
        // Auto-save transcript after each exchange (debounced)
        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(() => _autoSaveTranscript(currentSessionId, transcript), 500)
        break
      }

      case 'clear_transcript': {
        pendingTranscript = []
        pendingAssistant = ''
        set({ transcript: [], assistantBuffer: '' })
        break
      }

      case 'modal_request': {
        if (event.modal) set({ modal: event.modal })
        break
      }

      case 'select_request': {
        if (event.modal && event.select_options) {
          set({
            selectRequest: {
              title: String(event.modal.title ?? 'Select'),
              command: String(event.modal.command ?? ''),
              options: event.select_options.map((o: any) => ({
                value: o.value, label: o.label, description: o.description, active: o.active,
              })),
            },
          })
        }
        break
      }

      case 'todo_update': {
        if (event.todo_markdown != null) set({ todoMarkdown: event.todo_markdown })
        break
      }

      case 'error': {
        if (busyTimer) { clearTimeout(busyTimer); busyTimer = null }
        set({ busy: false })
        if (event.message) {
          pendingTranscript.push({ role: 'system', text: `Error: ${event.message}` })
          set((s) => ({ transcript: [...s.transcript, ...pendingTranscript.splice(0)] }))
        }
        break
      }

      case 'shutdown': {
        if (busyTimer) { clearTimeout(busyTimer); busyTimer = null }
        set({ ready: false, connected: false, busy: false })
        break
      }
    }
  },
}))
