import { useChatStore } from '../../stores/chatStore'
import { useTranslation } from '../../stores/i18nStore'
import { Badge } from '../shared/Badge'

export function StatusBar() {
  const connected = useChatStore((s) => s.connected)
  const status = useChatStore((s) => s.status)
  const mcpServers = useChatStore((s) => s.mcpServers)
  const { t } = useTranslation()

  const provider = String(status.provider ?? 'disconnected')
  const model = String(status.model ?? '-')
  const mcpConnected = mcpServers.filter((s) => s.state === 'connected').length

  return (
    <footer className="h-8 border-t border-border bg-surface flex items-center px-4 gap-4 shrink-0">
      <Badge variant={connected ? 'success' : 'error'}>
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
        {provider}
      </Badge>

      {mcpConnected > 0 && (
        <Badge variant="info">
          MCP: {mcpConnected} connected
        </Badge>
      )}

      <Badge variant="default">
        {model}
      </Badge>

      <span className="flex-1" />

      <span className="text-[11px] text-text-tertiary">
        {connected ? t('status.connected') : t('status.disconnected')}
      </span>
    </footer>
  )
}
