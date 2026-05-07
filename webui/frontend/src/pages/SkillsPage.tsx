import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Upload, ToggleLeft, ToggleRight, FileText, ExternalLink, Plus, X } from 'lucide-react'
import { useSkillsStore } from '../stores/skillsStore'
import { useTranslation } from '../stores/i18nStore'
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
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  const handleToggle = async (name: string) => {
    try {
      await toggleSkill(name)
      toast('success', t('skills.toggled', `Skill toggled`))
    } catch (err) {
      toast('error', (err as Error).message)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('skills.deleteConfirm', `Delete skill "${name}"?`))) return
    try {
      await deleteSkill(name)
      toast('success', t('skills.deleted', 'Skill deleted'))
    } catch (err) {
      toast('error', (err as Error).message)
    }
  }

  const handleInstall = async () => {
    if (!installForm.name.trim()) {
      toast('error', t('skills.nameRequired', 'Skill name is required'))
      return
    }
    try {
      await createSkill({
        name: installForm.name.trim(),
        source: installForm.source.trim() || 'manual',
      })
      setShowInstallForm(false)
      setInstallForm({ name: '', source: '' })
      toast('success', t('skills.installed', 'Skill installed'))
    } catch (err) {
      toast('error', (err as Error).message)
    }
  }

  const handleViewDetail = (name: string) => {
    navigate(`/skills/${encodeURIComponent(name)}`)
  }

  if (loading && skills.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> {t('common.loading')}
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
              <Brain size={20} /> {t('skills.title')}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{t('skills.desc', 'Manage AI skills and extensions')}</p>
          </div>
          <Button variant="primary" onClick={() => setShowInstallForm(true)}>
            <Upload size={16} /> {t('skills.install')}
          </Button>
        </div>

        {/* Empty state */}
        {!loading && skills.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Brain size={40} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-secondary mb-1">{t('skills.noSkills')}</p>
            <p className="text-xs text-text-tertiary mb-4">{t('skills.noSkillsDesc')}</p>
            <Button variant="primary" onClick={() => setShowInstallForm(true)}>
              <Upload size={14} /> {t('skills.installFirst', 'Install Your First Skill')}
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
                          title={skill.enabled ? t('skills.disable', 'Disable') : t('skills.enable', 'Enable')}
                        >
                          {skill.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                          className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                          title={t('skills.viewDetails', 'View details')}
                        >
                          <FileText size={14} />
                        </button>
                        {/* Link to skill detail page */}
                        <button
                          onClick={() => handleViewDetail(skill.name)}
                          className="p-1 text-text-tertiary hover:text-primary transition-colors"
                          title={t('skills.openDetail', 'Open detail page')}
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.name)}
                          className="p-1 text-text-tertiary hover:text-danger transition-colors"
                          title={t('skills.delete', 'Delete')}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-text-secondary mb-2">{t('skills.content', 'Content:')}</div>
                        <pre className="bg-code border border-border rounded p-3 text-xs text-text-primary overflow-x-auto max-h-64 whitespace-pre-wrap font-mono">
                          {skill.content || t('skills.noContent', 'No content available.')}
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
      <Modal open={showInstallForm} onClose={() => setShowInstallForm(false)} title={t('skills.installTitle', 'Install Skill')}>
        <div className="space-y-4">
          <Input
            label={t('skills.nameLabel', 'Skill Name')}
            placeholder={t('skills.namePlaceholder', 'my-skill')}
            value={installForm.name}
            onChange={(e) => setInstallForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label={t('skills.sourceLabel', 'Source File Path')}
            placeholder={t('skills.sourcePlaceholder', '/path/to/skill.yaml or URL')}
            value={installForm.source}
            onChange={(e) => setInstallForm((f) => ({ ...f, source: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowInstallForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleInstall}>
              {t('skills.install')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
