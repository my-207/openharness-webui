import { useState, useEffect, useRef, useCallback } from 'react'
import { BrainCircuit, Search, Plus, Pencil, Trash2, Tag, X } from 'lucide-react'
import { useMemoryStore } from '../stores/memoryStore'
import { Button } from '../components/shared/Button'
import { Input, TextArea } from '../components/shared/Input'
import { Badge } from '../components/shared/Badge'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'
import type { MemEntry } from '../stores/memoryStore'

export function MemoryPage() {
  const { entries, searchResults, loading, fetchEntries, createEntry, updateEntry, deleteEntry, searchEntries } =
    useMemoryStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formContent, setFormContent] = useState('')
  const [formTagsStr, setFormTagsStr] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        if (q.trim()) {
          searchEntries(q.trim())
        }
      }, 300)
    },
    [searchEntries],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const displayedEntries = searchQuery.trim() ? searchResults : entries

  const handleAdd = async () => {
    if (!formContent.trim()) {
      toast('error', 'Content is required')
      return
    }
    try {
      const tags = formTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await createEntry({ content: formContent.trim(), tags })
      setShowAddForm(false)
      setFormContent('')
      setFormTagsStr('')
      toast('success', 'Memory entry added')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const handleEdit = async (entry: MemEntry) => {
    if (!formContent.trim()) {
      toast('error', 'Content is required')
      return
    }
    try {
      const tags = formTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await updateEntry(entry.id, { content: formContent.trim(), tags })
      setEditId(null)
      setFormContent('')
      setFormTagsStr('')
      toast('success', 'Memory entry updated')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory entry permanently?')) return
    try {
      await deleteEntry(id)
      toast('success', 'Memory entry deleted')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const startEdit = (entry: MemEntry) => {
    setEditId(entry.id)
    setFormContent(entry.content)
    setFormTagsStr((entry.tags || []).join(', '))
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditId(null)
    setFormContent('')
    setFormTagsStr('')
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

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <BrainCircuit size={20} /> Memory
            </h1>
            <p className="text-sm text-text-secondary mt-1">Persistent knowledge entries</p>
          </div>
          <Button variant="primary" onClick={() => { setShowAddForm(!showAddForm); setEditId(null) }}>
            <Plus size={16} /> Add Entry
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search memory entries..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-surface-secondary border border-border rounded-lg space-y-3">
            <TextArea
              label="Content"
              placeholder="What would you like to remember?"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={3}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="e.g. project, config, note"
              value={formTagsStr}
              onChange={(e) => setFormTagsStr(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowAddForm(false); setFormContent(''); setFormTagsStr('') }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && entries.length === 0 && (
          <div className="flex items-center justify-center py-12 text-text-tertiary">
            <Spinner className="mr-2" /> Loading memory entries...
          </div>
        )}

        {/* Empty */}
        {!loading && displayedEntries.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <BrainCircuit size={32} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-secondary">
              {searchQuery.trim() ? 'No entries match your search.' : 'No memory entries yet.'}
            </p>
          </div>
        )}

        {/* Entries list */}
        {displayedEntries.length > 0 && (
          <div className="space-y-2">
            {displayedEntries.map((entry) => {
              const isEditing = editId === entry.id
              return (
                <div
                  key={entry.id}
                  className="bg-surface-secondary border border-border rounded-lg p-4"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <TextArea
                        label="Content"
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        rows={3}
                      />
                      <Input
                        label="Tags (comma-separated)"
                        value={formTagsStr}
                        onChange={(e) => setFormTagsStr(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleEdit(entry)}>
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-text-tertiary">{shortId(entry.id)}</span>
                            <span className="text-xs text-text-tertiary">{formatDate(entry.created_at)}</span>
                          </div>
                          <p className="text-sm text-text-primary whitespace-pre-wrap break-words line-clamp-3">
                            {entry.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1 text-text-tertiary hover:text-danger transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="default">
                              <Tag size={10} /> {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
