import { useState } from 'react'
import { GitBranch, Link, Link2Off, Plus } from 'lucide-react'
import { Button } from '../components/shared/Button'

interface BridgeSession {
  id: string
  name: string
  target: string
  status: 'connected' | 'disconnected'
}

export function BridgePage() {
  const [sessions, setSessions] = useState<BridgeSession[]>([
    { id: 'br-001', name: 'VS Code', target: 'vscode://codebuddy/bridge', status: 'connected' },
  ])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newType, setNewType] = useState('vscode')

  const handleAdd = () => {
    if (!newName.trim() || !newTarget.trim()) return
    setSessions((prev) => [
      ...prev,
      { id: `br-${Date.now()}`, name: newName.trim(), target: newTarget.trim(), status: 'disconnected' },
    ])
    setNewName('')
    setNewTarget('')
    setShowNew(false)
  }

  const toggleConnection = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'connected' ? 'disconnected' : 'connected' }
          : s
      )
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-text-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Bridge</h1>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus size={14} className="mr-1.5" />
          New Bridge
        </Button>
      </div>

      {showNew && (
        <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
          <input
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
            placeholder="Bridge name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            <option value="vscode">VS Code</option>
            <option value="idea">JetBrains IDEA</option>
            <option value="custom">Custom</option>
          </select>
          <input
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
            placeholder="Target URL"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!newName.trim() || !newTarget.trim()}>Create</Button>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <GitBranch size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No bridge sessions</p>
          <p className="text-xs mt-1">Create a bridge to connect external IDE instances</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Target</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-surface-tertiary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs text-text-primary font-medium">{session.name}</div>
                    <div className="text-[10px] text-text-tertiary font-mono">{session.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary truncate max-w-xs">{session.target}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 text-xs ${session.status === 'connected' ? 'text-emerald-400' : 'text-text-tertiary'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${session.status === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {session.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleConnection(session.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                        session.status === 'connected'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {session.status === 'connected' ? <Link2Off size={12} /> : <Link size={12} />}
                      {session.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
