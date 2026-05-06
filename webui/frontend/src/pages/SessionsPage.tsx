import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Search, Play, Trash2, MessageSquare } from 'lucide-react'
import { useSessionsStore } from '../stores/sessionsStore'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { Badge } from '../components/shared/Badge'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'

export function SessionsPage() {
  const { sessions, loading, fetchSessions, deleteSession } = useSessionsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return sessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.model.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q),
    )
  }, [sessions, searchQuery])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session permanently?')) return
    setDeleting(id)
    try {
      await deleteSession(id)
      toast('success', 'Session deleted')
    } catch (err) {
      toast('error', `Failed to delete: ${(err as Error).message}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleContinue = (id: string) => {
    navigate(`/chat?session=${id}`)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <History size={20} /> Sessions
            </h1>
            <p className="text-sm text-text-secondary mt-1">Browse and resume previous conversations</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search by name, model, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading */}
        {loading && sessions.length === 0 && (
          <div className="flex items-center justify-center py-12 text-text-tertiary">
            <Spinner className="mr-2" /> Loading sessions...
          </div>
        )}

        {/* Empty */}
        {!loading && filteredSessions.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <History size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-secondary">
              {searchQuery ? 'No sessions match your search.' : 'No sessions yet. Start a conversation in Chat!'}
            </p>
          </div>
        )}

        {/* Sessions table */}
        {filteredSessions.length > 0 && (
          <div className="bg-surface-secondary border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Model</th>
                  <th className="text-left px-4 py-3 font-medium">Provider</th>
                  <th className="text-center px-4 py-3 font-medium">Messages</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-b-0 hover:bg-surface-tertiary/40 transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{s.model}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{s.provider}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
                        <MessageSquare size={12} />
                        {s.message_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleContinue(s.id)} title="Continue session">
                          <Play size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
