import { useState, useEffect } from 'react'
import { Brain, Upload, ToggleLeft, ToggleRight, FileText, ExternalLink, Plus, X } from 'lucide-react'
import { useSkillsStore } from '../stores/skillsStore'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { Modal } from '../components/shared/Modal'
import { Badge } from '../components/shared/Badge'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'

export function SkillsPage() {
  const { skills, loading, fetchSkills, createSkill, toggleSkill, deleteSkill } = useSkillsStore()
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [showInstallForm, setShowInstallForm] = useState(false)
  const [installForm, setInstallForm] = useState({ name: '', source: '' })

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const handleToggle = async (name: string) => {
    try {
      await toggleSkill(name)
      toast('success', `Skill ${skills.find((s) => s.name === name)?.enabled ? 'disabled' : 'enabled'}`)
    } catch (err) {
      toast('error', `Failed to toggle: ${(err as Error).message}`)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return
    try {
      await deleteSkill(name)
      toast('success', 'Skill deleted')
    } catch (err) {
      toast('error', `Failed to delete: ${(err as Error).message}`)
    }
  }

  const handleInstall = async () => {
    if (!installForm.name.trim()) {
      toast('error', 'Skill name is required')
      return
    }
    try {
      await createSkill({ name: installForm.name.trim(), source: installForm.source.trim() })
      setShowInstallForm(false)
      setInstallForm({ name: '', source: '' })
      toast('success', 'Skill installed')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  if (loading && skills.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> Loading skills...
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
              <Brain size={20} /> Skills
            </h1>
            <p className="text-sm text-text-secondary mt-1">Manage AI skills and extensions</p>
          </div>
          <Button variant="primary" onClick={() => setShowInstallForm(true)}>
            <Upload size={16} /> Install Skill
          </Button>
        </div>

        {/* Empty state */}
        {skills.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Brain size={40} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-secondary mb-1">No skills installed.</p>
            <p className="text-xs text-text-tertiary mb-4">Install a skill to extend AI capabilities.</p>
            <Button variant="primary" onClick={() => setShowInstallForm(true)}>
              <Upload size={14} /> Install Your First Skill
            </Button>
          </div>
        )}

        {/* Skills grid */}
        {skills.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((skill) => {
              const isExpanded = expandedSkill === skill.name
              return (
                <div
                  key={skill.name}
                  className={`bg-surface-secondary border rounded-lg overflow-hidden transition-all ${
                    isExpanded ? 'border-primary col-span-full sm:col-span-2 lg:col-span-3' : 'border-border hover:border-primary/30'
                  }`}
                >
                  {/* Card header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-sm font-medium text-text-primary truncate cursor-pointer"
                            onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                          >
                            {skill.name}
                          </h3>
                          <Badge variant="default" className="shrink-0">{skill.source}</Badge>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{skill.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <button
                          onClick={() => handleToggle(skill.name)}
                          className={`p-1 rounded transition-colors ${
                            skill.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-text-tertiary hover:text-text-secondary'
                          }`}
                          title={skill.enabled ? 'Disable' : 'Enable'}
                        >
                          {skill.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                          className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                          title="View details"
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.name)}
                          className="p-1 text-text-tertiary hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-text-secondary mb-2">Content:</div>
                        <pre className="bg-code border border-border rounded p-3 text-xs text-text-primary overflow-x-auto max-h-64 whitespace-pre-wrap font-mono">
                          {skill.content || 'No content available.'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Install Skill modal */}
      <Modal open={showInstallForm} onClose={() => setShowInstallForm(false)} title="Install Skill">
        <div className="space-y-4">
          <Input
            label="Skill Name"
            placeholder="my-skill"
            value={installForm.name}
            onChange={(e) => setInstallForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Source File Path"
            placeholder="/path/to/skill.yaml or URL"
            value={installForm.source}
            onChange={(e) => setInstallForm((f) => ({ ...f, source: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowInstallForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInstall}>
              Install
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
