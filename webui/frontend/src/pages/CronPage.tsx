import { useState, useEffect } from 'react'
import { Clock, Play, Square, ToggleLeft, ToggleRight, Plus, Trash2, History } from 'lucide-react'
import { useCronStore } from '../stores/cronStore'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'

function formatDateTime(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleString()
}

export function CronPage() {
  const { jobs, schedulerActive, loading, fetchJobs, toggleScheduler, toggleJob, deleteJob, createJob } = useCronStore()
  const [showNewJob, setShowNewJob] = useState(false)
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [cronExpr, setCronExpr] = useState('')
  const [command, setCommand] = useState('')

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleNewJob = async () => {
    if (!name.trim() || !cronExpr.trim() || !command.trim()) return
    try {
      await createJob({ name: name.trim(), schedule: cronExpr.trim(), command: command.trim() })
      setShowNewJob(false)
      setName('')
      setCronExpr('')
      setCommand('')
    } catch { /* handled by store */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-text-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Cron Jobs</h1>
        </div>
        <Button onClick={() => setShowNewJob(!showNewJob)}>
          <Plus size={14} className="mr-1.5" />New Job
        </Button>
      </div>

      {/* Scheduler */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${schedulerActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <div>
            <div className="text-sm text-text-primary font-medium">Scheduler</div>
            <div className="text-xs text-text-tertiary">{schedulerActive ? 'Running' : 'Stopped'}</div>
          </div>
        </div>
        <Button
          variant={schedulerActive ? 'danger' : 'primary'}
          onClick={toggleScheduler}
        >
          {schedulerActive ? <Square size={14} className="mr-1.5" /> : <Play size={14} className="mr-1.5" />}
          {schedulerActive ? 'Stop' : 'Start'}
        </Button>
      </div>

      {showNewJob && (
        <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Job name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Cron expression (e.g., 0 9 * * 1)" value={cronExpr} onChange={(e) => setCronExpr(e.target.value)} />
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Command" value={command} onChange={(e) => setCommand(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleNewJob} disabled={!name.trim() || !cronExpr.trim()}>Create</Button>
            <Button variant="secondary" onClick={() => setShowNewJob(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
          <Clock size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No cron jobs configured</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-tertiary/50 text-text-tertiary text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Schedule</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Last Run</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.name} className="hover:bg-surface-tertiary/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-text-primary font-medium">{job.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-text-secondary">{job.schedule}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${job.status === 'enabled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-tertiary text-text-tertiary'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-tertiary">{formatDateTime(job.last_run)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1 hover:bg-surface-tertiary rounded text-text-tertiary hover:text-text-primary"
                        onClick={() => toggleJob(job.name)}>
                        {job.status === 'enabled' ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                      </button>
                      <button className="p-1 hover:bg-surface-tertiary rounded text-text-tertiary hover:text-text-primary"
                        onClick={() => setShowHistory(showHistory === job.name ? null : job.name)}>
                        <History size={14} />
                      </button>
                      <button className="p-1 hover:bg-red-500/10 rounded text-text-tertiary hover:text-danger"
                        onClick={() => deleteJob(job.name)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHistory(null)}>
          <div className="bg-surface border border-border rounded-lg w-full max-w-lg max-h-[60vh] m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">History: {showHistory}</h3>
              <button className="text-text-tertiary hover:text-text-primary" onClick={() => setShowHistory(null)}>✕</button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
              <p className="text-xs text-text-tertiary">No history records available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
