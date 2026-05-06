import { useChatStore } from '../../stores/chatStore'
import { Badge } from '../shared/Badge'

export function RightPanel() {
  const status = useChatStore((s) => s.status)
  const mcpServers = useChatStore((s) => s.mcpServers)
  const commands = useChatStore((s) => s.commands)
  const transcript = useChatStore((s) => s.transcript)

  const msgCount = transcript.filter((t) => t.role === 'user' || t.role === 'assistant').length

  return (
    <aside className="w-64 border-l border-border bg-surface shrink-0 overflow-y-auto scroll-thin hidden lg:block">
      {/* Session info */}
      <div className="p-3 border-b border-border">
        <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Session Info</h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Messages</span>
            <span className="text-text-primary">{msgCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Tokens</span>
            <span className="text-text-primary">-</span>
          </div>
        </div>
      </div>

      {/* MCP Status */}
      {mcpServers.length > 0 && (
        <div className="p-3 border-b border-border">
          <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">MCP Servers</h3>
          <div className="space-y-1">
            {mcpServers.map((srv) => (
              <div key={srv.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className={`w-1.5 h-1.5 rounded-full ${srv.state === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {srv.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commands */}
      <div className="p-3">
        <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">Commands</h3>
        <div className="flex flex-wrap gap-1">
          {commands.slice(0, 8).map((cmd) => (
            <Badge key={cmd} variant="default">{cmd}</Badge>
          ))}
        </div>
      </div>
    </aside>
  )
}
