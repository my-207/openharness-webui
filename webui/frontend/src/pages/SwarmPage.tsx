import { useState, useEffect } from 'react'
import { Users, UserPlus, Trash2, Bell, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useSwarmStore } from '../stores/swarmStore'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'

function statusConfig(status: string) {
  switch (status) {
    case 'running': return { color: 'text-emerald-400', pulse: true, label: 'Running' }
    case 'idle': return { color: 'text-gray-400', pulse: false, label: 'Idle' }
    case 'completed': return { color: 'text-blue-400', pulse: false, label: 'Completed' }
    case 'error': return { color: 'text-red-400', pulse: false, label: 'Error' }
    default: return { color: 'text-text-tertiary', pulse: false, label: status }
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatTime(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SwarmPage() {
  const { teammates, notifications, loading, fetchTeammates, createTeam, deleteTeam, fetchNotifications } = useSwarmStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [memberNames, setMemberNames] = useState('')

  useEffect(() => {
    fetchTeammates()
    fetchNotifications()
  }, [fetchTeammates, fetchNotifications])

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    try {
      await createTeam({
        name: teamName.trim(),
        members: memberNames.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setShowCreateForm(false)
      setTeamName('')
      setMemberNames('')
    } catch { /* handled by store */ }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-text-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Swarm</h1>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus size={14} className="mr-1.5" />Create Team
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <input className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary"
            placeholder="Member names (comma separated)" value={memberNames} onChange={(e) => setMemberNames(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleCreateTeam} disabled={!teamName.trim()}>Create</Button>
            <Button variant="secondary" onClick={() => setShowCreateForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Teammates */}
      <h2 className="text-sm font-medium text-text-primary mb-3">Teammates ({teammates.length})</h2>
      {teammates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
          <Users size={32} className="mb-2 opacity-30" />
          <p className="text-xs">No teammates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {teammates.map((tm) => (
            <div key={tm.name} className="border border-border rounded-lg bg-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{tm.name}</span>
                <div className={`flex items-center gap-1.5 text-xs ${statusConfig(tm.status).color}`}>
                  {tm.status === 'running' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig(tm.status).color.replace('text-', 'bg-')}`} />
                  )}
                  {statusConfig(tm.status).label}
                </div>
              </div>
              <div className="text-xs text-text-tertiary space-y-0.5">
                <div>Duration: {formatDuration(tm.duration_seconds)}</div>
                <div>Task: {tm.current_task || 'None'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications */}
      <h2 className="text-sm font-medium text-text-primary mb-3">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-text-tertiary">
          <Bell size={16} className="mr-2 opacity-30" />
          <span className="text-xs">No notifications</span>
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
          {notifications.map((notif, i) => (
            <div key={i} className="px-4 py-2 flex items-center gap-3 text-xs">
              <span className="text-text-tertiary shrink-0 w-12">{formatTime(notif.time)}</span>
              <span className={`text-[10px] px-1 py-0.5 rounded uppercase ${
                notif.type === 'info' ? 'bg-blue-500/10 text-blue-400'
                : notif.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400'
                : notif.type === 'error' ? 'bg-red-500/10 text-red-400'
                : 'bg-surface-tertiary text-text-tertiary'
              }`}>{notif.type}</span>
              <span className="text-text-secondary">{notif.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
