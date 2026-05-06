// ─── Protocol: Frontend → Backend ───

export type FrontendRequestType =
  | 'submit_line'
  | 'permission_response'
  | 'question_response'
  | 'list_sessions'
  | 'select_command'
  | 'apply_select_command'
  | 'interrupt'
  | 'shutdown'

export interface FrontendRequest {
  type: FrontendRequestType
  line?: string
  command?: string
  value?: string
  request_id?: string
  allowed?: boolean
  answer?: string
}

// ─── Protocol: Backend → Frontend ───

export type BackendEventType =
  | 'ready'
  | 'state_snapshot'
  | 'tasks_snapshot'
  | 'transcript_item'
  | 'compact_progress'
  | 'assistant_delta'
  | 'assistant_complete'
  | 'line_complete'
  | 'tool_started'
  | 'tool_completed'
  | 'clear_transcript'
  | 'modal_request'
  | 'select_request'
  | 'todo_update'
  | 'plan_mode_change'
  | 'swarm_status'
  | 'error'
  | 'shutdown'

export interface TranscriptItem {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'tool_result' | 'log'
  text: string
  tool_name?: string
  tool_input?: Record<string, unknown>
  is_error?: boolean
}

export interface BackendEvent {
  type: BackendEventType
  message?: string | null
  item?: TranscriptItem | null
  state?: Record<string, unknown> | null
  tasks?: TaskSnapshot[] | null
  mcp_servers?: McpServerSnapshot[] | null
  bridge_sessions?: BridgeSessionSnapshot[] | null
  commands?: string[] | null
  modal?: Record<string, unknown> | null
  select_options?: SelectOption[] | null
  tool_name?: string | null
  tool_input?: Record<string, unknown> | null
  output?: string | null
  is_error?: boolean | null
  compact_phase?: string | null
  compact_trigger?: string | null
  attempt?: number | null
  todo_markdown?: string | null
  plan_mode?: string | null
  swarm_teammates?: SwarmTeammate[] | null
  swarm_notifications?: SwarmNotification[] | null
}

export interface TaskSnapshot {
  id: string
  type: string
  status: string
  description: string
  metadata: Record<string, string>
}

export interface McpServerSnapshot {
  name: string
  state: string
  detail?: string
  transport?: string
  auth_configured?: boolean
  tool_count?: number
  resource_count?: number
}

export interface BridgeSessionSnapshot {
  session_id: string
  command: string
  cwd: string
  pid: number
  status: string
  started_at: number
  output_path: string
}

export interface SelectOption {
  value: string
  label: string
  description?: string
  active?: boolean
}

export interface SwarmTeammate {
  name: string
  status: 'running' | 'idle' | 'done' | 'error'
  duration?: number
  task?: string
}

export interface SwarmNotification {
  from: string
  message: string
  timestamp: number
}

// ─── Provider Profile (REST) ───

export interface ProviderProfile {
  name: string
  label: string
  provider: string
  api_format: string
  auth_source: string
  model: string
  base_url?: string
  configured: boolean
  active: boolean
  credential_slot?: string
  allowed_models?: string[]
  context_window_tokens?: number
  auto_compact_threshold_tokens?: number
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  latency_ms: number
  models?: string[]
}
