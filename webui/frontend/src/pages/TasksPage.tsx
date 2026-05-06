import { useState, useEffect } from 'react'
import { ListTodo, Play, Square, StopCircle, FileText, Loader2, X } from 'lucide-react'
import { useTasksStore } from '../stores/tasksStore'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { Select } from '../components/shared/Select'
import { Modal } from '../components/shared/Modal'
import { Badge } from '../components/shared/Badge'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'

const TYPE_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  agent: 'info',
  shell: 'success',
}

const STATUS_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  running: 'success',
  completed: 'default',
  failed: 'error',
  stopped: 'warning',
}

export function TasksPage() {
  const { tasks, loading, fetchTasks, createTask, stopTask, getTask } = useTasksStore()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newType, setNewType] = useState('agent')
  const [newDescription, setNewDescription] = useState('')
  const [viewOutputId, setViewOutputId] = useState<string | null>(null)
  const [outputContent, setOutputContent] = useState('')
  const [outputLoading, setOutputLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreate = async () => {
    if (!newDescription.trim()) {
      toast('error', 'Description is required')
      return
    }
    try {
      await createTask({ type: newType, description: newDescription.trim() })
      setShowNewForm(false)
      setNewDescription('')
      setNewType('agent')
      toast('success', 'Task created')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const handleStop = async (id: string) => {
    try {
      await stopTask(id)
      toast('success', 'Task stopped')
    } catch (err) {
      toast('error', `Failed to stop: ${(err as Error).message}`)
    }
  }

  const handleViewOutput = async (id: string) => {
    setViewOutputId(id)
    setOutputLoading(true)
    setOutputContent('')
    try {
      const task = await getTask(id)
      setOutputContent(task?.output || 'No output captured.')
    } catch (err) {
      setOutputContent(`Error loading output: ${(err as Error).message}`)
    } finally {
      setOutputLoading(false)
    }
  }

  const shortId = (id: string) => (id.length > 8 ? id.slice(0, 8) + '...' : id)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> Loading tasks...
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <ListTodo size={20} /> Tasks
            </h1>
            <p className="text-sm text-text-secondary mt-1">Background task management</p>
          </div>
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            <Play size={16} /> New Task
          </Button>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <ListTodo size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-secondary mb-1">No tasks yet.</p>
            <p className="text-xs text-text-tertiary">Create a task to run background operations.</p>
          </div>
        )}

        {/* Tasks table */}
        {tasks.length > 0 && (
          <div className="bg-surface-secondary border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/50 last:border-b-0 hover:bg-surface-tertiary/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-text-tertiary font-mono text-xs">{shortId(t.id)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={TYPE_BADGE[t.type] || 'default'}>{t.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        {t.status === 'running' && <Loader2 size={12} className="animate-spin text-emerald-400" />}
                        <Badge variant={STATUS_BADGE[t.status] || 'default'}>{t.status}</Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-3 text-text-tertiary text-xs whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOutput(t.id)} title="View output">
                          <FileText size={14} />
                        </Button>
                        {t.status === 'running' && (
                          <Button variant="ghost" size="sm" onClick={() => handleStop(t.id)} title="Stop task">
                            <StopCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Task modal */}
      <Modal open={showNewForm} onClose={() => setShowNewForm(false)} title="New Task">
        <div className="space-y-4">
          <Select
            label="Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            options={[
              { value: 'agent', label: 'Agent' },
              { value: 'shell', label: 'Shell' },
            ]}
          />
          <Input
            label="Description"
            placeholder="What should this task do?"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowNewForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Start Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Output viewer modal */}
      <Modal
        open={viewOutputId !== null}
        onClose={() => { setViewOutputId(null); setOutputContent('') }}
        title="Task Output"
        className="max-w-2xl"
      >
        {outputLoading ? (
          <div className="flex items-center justify-center py-8 text-text-tertiary">
            <Spinner className="mr-2" /> Loading output...
          </div>
        ) : (
          <pre className="bg-code border border-border rounded p-3 text-xs text-text-primary overflow-x-auto max-h-96 whitespace-pre-wrap font-mono">
            {outputContent}
          </pre>
        )}
      </Modal>
    </div>
  )
}
