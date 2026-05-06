import { useEffect, useState } from 'react'
import { Bot, Activity, ScanLine, Play, Download, Plus, FileText, Layers, Loader2 } from 'lucide-react'
import { Spinner } from '../components/shared/Spinner'
import { Button } from '../components/shared/Button'
import { useAutopilotStore } from '../stores/autopilotStore'

export function AutopilotPage() {
  const { dashboard, entries, loading, fetchStatus, fetchEntries, addEntry, triggerScan, runNext, exportDashboard } = useAutopilotStore()
  const [showAdd, setShowAdd] = useState(false)
  const [addPath, setAddPath] = useState('')
  const [addContext, setAddContext] = useState('')
  const [addPriority, setAddPriority] = useState('medium')

  useEffect(() => {
    fetchStatus()
    fetchEntries()
  }, [fetchStatus, fetchEntries])

  const handleAdd = async () => {
    if (!addPath.trim()) return
    await addEntry({ path: addPath.trim(), context: addContext.trim(), priority: addPriority })
    setAddPath('')
    setAddContext('')
    setShowAdd(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Autopilot</h1>
          <p className="text-sm text-text-tertiary mt-0.5">Repository auto-navigation</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-text-tertiary text-xs mb-1">Status</div>
          <div className={`text-lg font-semibold flex items-center gap-2 ${dashboard?.active ? 'text-emerald-400' : 'text-text-tertiary'}`}>
            <Activity size={16} />
            {dashboard?.active ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-tertiary text-xs mb-1">Scanned Files</div>
          <div className="text-lg font-semibold text-text-primary">{dashboard?.scanned_files ?? 0}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-tertiary text-xs mb-1">Entries</div>
          <div className="text-lg font-semibold text-text-primary">{dashboard?.entries_count ?? 0}</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-tertiary text-xs mb-1">Last Scan</div>
          <div className="text-sm text-text-secondary truncate">
            {dashboard?.last_scan ? new Date(dashboard.last_scan).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <Button onClick={triggerScan}><ScanLine size={14} className="mr-1.5" />Scan Now</Button>
        <Button onClick={runNext}><Play size={14} className="mr-1.5" />Run Next</Button>
        <Button variant="secondary" onClick={exportDashboard}><Download size={14} className="mr-1.5" />Export</Button>
        <Button variant="secondary" onClick={() => setShowAdd(!showAdd)}><Plus size={14} className="mr-1.5" />Add Entry</Button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
          <input
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary"
            placeholder="File path"
            value={addPath}
            onChange={(e) => setAddPath(e.target.value)}
          />
          <textarea
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder-text-tertiary resize-none"
            rows={2}
            placeholder="Context description"
            value={addContext}
            onChange={(e) => setAddContext(e.target.value)}
          />
          <select
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            value={addPriority}
            onChange={(e) => setAddPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!addPath.trim()}>Add</Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Entries table */}
      <h2 className="text-sm font-medium text-text-primary mb-3">Entries</h2>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
          <Layers size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No autopilot entries</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Path</th>
                <th className="text-left px-4 py-2 font-medium">Context</th>
                <th className="text-left px-4 py-2 font-medium">Priority</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry, i) => (
                <tr key={i} className="hover:bg-surface-tertiary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-primary font-mono">{entry.path}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary max-w-xs truncate">{entry.context}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      entry.priority === 'high' ? 'bg-red-500/10 text-red-400'
                      : entry.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-surface-tertiary text-text-tertiary'
                    }`}>{entry.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{entry.status}</td>
                  <td className="px-4 py-3 text-xs text-text-tertiary">
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '-'}
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
