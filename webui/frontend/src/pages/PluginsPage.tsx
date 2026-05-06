import { useState, useEffect } from 'react'
import { Plug, Package, ToggleLeft, ToggleRight, Trash2, Download, Box } from 'lucide-react'
import { usePluginsStore } from '../stores/pluginsStore'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'

export function PluginsPage() {
  const { plugins, loading, fetchPlugins, installPlugin, uninstallPlugin, togglePlugin } = usePluginsStore()
  const [showInstallForm, setShowInstallForm] = useState(false)
  const [name, setName] = useState('')
  const [source, setSource] = useState('')

  useEffect(() => { fetchPlugins() }, [fetchPlugins])

  const handleInstall = async () => {
    if (!name.trim() || !source.trim()) return
    try {
      await installPlugin({ name: name.trim(), source: source.trim() })
      setShowInstallForm(false)
      setName('')
      setSource('')
    } catch { /* handled by store */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Plug size={18} className="text-text-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Plugins</h1>
        </div>
        <Button onClick={() => setShowInstallForm(!showInstallForm)}>
          <Download size={14} className="mr-1.5" />Install Plugin
        </Button>
      </div>

      {showInstallForm && (
        <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Plugin name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Source (npm package or path)" value={source} onChange={(e) => setSource(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleInstall} disabled={!name.trim() || !source.trim()}>Install</Button>
            <Button variant="secondary" onClick={() => setShowInstallForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {plugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <Package size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No plugins installed</p>
          <p className="text-xs mt-1">Install a plugin to extend functionality</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => (
            <div key={plugin.name} className="border border-border rounded-lg bg-surface p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate">{plugin.name}</h3>
                  <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{plugin.description}</p>
                </div>
                <button onClick={() => togglePlugin(plugin.name)}
                  className={`ml-2 p-1 rounded ${plugin.enabled ? 'text-primary' : 'text-text-tertiary'}`}>
                  {plugin.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-tertiary text-text-tertiary">
                  v{plugin.version}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${plugin.enabled ? 'bg-primary/10 text-primary' : 'bg-surface-tertiary text-text-tertiary'}`}>
                  {plugin.enabled ? 'enabled' : 'disabled'}
                </span>
              </div>
              {plugin.commands?.length > 0 && (
                <div className="mt-2 text-[10px] text-text-tertiary">
                  Commands: {plugin.commands.join(', ')}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button onClick={() => uninstallPlugin(plugin.name)}
                  className="p-1.5 hover:bg-red-500/10 rounded text-text-tertiary hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
