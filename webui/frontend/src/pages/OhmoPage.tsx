import { useEffect, useState } from 'react'
import { Home, Radio, Share2, BrainCircuit, Play, Square, RefreshCw, Settings as SettingsIcon } from 'lucide-react'
import { Spinner } from '../components/shared/Spinner'
import { Button } from '../components/shared/Button'
import { useOhmoStore } from '../stores/ohmoStore'

type Tab = 'workspace' | 'gateway' | 'channels' | 'memory'

export function OhmoPage() {
  const { workspace, gateway, channels, loading, fetchWorkspace, fetchGatewayStatus, startGateway, stopGateway, restartGateway, fetchChannels, updateChannels } = useOhmoStore()
  const [activeTab, setActiveTab] = useState<Tab>('workspace')

  useEffect(() => {
    fetchWorkspace()
    fetchGatewayStatus()
    fetchChannels()
  }, [fetchWorkspace, fetchGatewayStatus, fetchChannels])

  if (loading && !workspace) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: 'workspace', icon: Home, label: 'Workspace' },
    { id: 'gateway', icon: Radio, label: 'Gateway' },
    { id: 'channels', icon: Share2, label: 'Channels' },
    { id: 'memory', icon: BrainCircuit, label: 'Memory' },
  ]

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-lg font-semibold text-text-primary mb-4">OhMo</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'workspace' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-text-tertiary mb-1">Workspace Path</div>
            <div className="text-sm text-text-primary font-mono">{workspace?.path || 'N/A'}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-text-tertiary mb-1">Files</div>
            <div className="text-sm text-text-primary">{workspace?.file_count || 0} files</div>
          </div>
          {workspace?.files && workspace.files.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-xs text-text-tertiary mb-2">Recent Files</div>
              <div className="space-y-1">
                {workspace.files.slice(0, 20).map((f) => (
                  <div key={f} className="text-xs text-text-secondary font-mono">{f}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'gateway' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-text-tertiary mb-1">Gateway Status</div>
                <div className={`text-lg font-semibold flex items-center gap-2 ${gateway?.status === 'running' ? 'text-emerald-400' : 'text-text-tertiary'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${gateway?.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {gateway?.status === 'running' ? 'Running' : 'Stopped'}
                </div>
              </div>
              <div className="flex gap-2">
                {gateway?.status === 'running' ? (
                  <Button variant="danger" onClick={stopGateway}><Square size={14} className="mr-1.5" />Stop</Button>
                ) : (
                  <Button onClick={startGateway}><Play size={14} className="mr-1.5" />Start</Button>
                )}
                <Button variant="secondary" onClick={restartGateway}><RefreshCw size={14} className="mr-1.5" />Restart</Button>
              </div>
            </div>
            {gateway?.status === 'running' && (
              <div className="text-xs text-text-tertiary">
                PID: {gateway.pid} · Started: {gateway.uptime ? new Date(gateway.uptime).toLocaleString() : 'N/A'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.platform} className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
              <div>
                <div className="text-sm text-text-primary font-medium capitalize">{ch.platform}</div>
                <div className="text-xs text-text-tertiary">
                  {ch.enabled ? 'Enabled' : 'Disabled'}
                  {Object.keys(ch.config).length > 0 && ` · ${Object.keys(ch.config).length} configs`}
                </div>
              </div>
              <button
                onClick={async () => {
                  const updated = channels.map((c) =>
                    c.platform === ch.platform ? { ...c, enabled: !c.enabled } : c
                  )
                  await updateChannels(updated)
                }}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  ch.enabled
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-surface-tertiary text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {ch.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'memory' && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <BrainCircuit size={48} className="mb-3 opacity-30" />
          <p className="text-sm">OhMo memory management</p>
          <p className="text-xs mt-1">Visit the <a href="/memory" className="text-primary underline">Memory page</a> for full memory management</p>
        </div>
      )}
    </div>
  )
}
