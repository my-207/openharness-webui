import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft, ToggleRight, ToggleLeft, ExternalLink, Calendar, Tag, FileText } from 'lucide-react'
import { useSkillsStore } from '../stores/skillsStore'
import { useTranslation } from '../stores/i18nStore'
import { Button } from '../components/shared/Button'
import { Badge } from '../components/shared/Badge'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'
import type { Skill } from '../stores/skillsStore'

export function SkillDetailPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { skills, fetchSkills, toggleSkill, deleteSkill } = useSkillsStore()
  const { t } = useTranslation()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      await fetchSkills()
      setLoading(false)
    }
    load()
  }, [fetchSkills])

  useEffect(() => {
    if (!loading) {
      const found = skills.find((s) => s.name === name)
      setSkill(found ?? null)
    }
  }, [skills, name, loading])

  const handleToggle = async () => {
    if (!skill) return
    try {
      await toggleSkill(skill.name)
      toast('success', skill.enabled ? t('skills.disabled', 'Skill disabled') : t('skills.enabled', 'Skill enabled'))
    } catch (err) {
      toast('error', (err as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!skill || !confirm(`Delete skill "${skill.name}"?`)) return
    try {
      await deleteSkill(skill.name)
      toast('success', t('skills.deleted', 'Skill deleted'))
      navigate('/skills')
    } catch (err) {
      toast('error', (err as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> {t('common.loading')}
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-text-secondary">
        <Brain size={48} className="mb-4 text-text-tertiary" />
        <p className="text-sm mb-4">{t('skills.notFound', 'Skill not found')}</p>
        <Button variant="primary" onClick={() => navigate('/skills')}>
          <ArrowLeft size={16} /> {t('skills.back', 'Back to Skills')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/skills')}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          {t('skills.back', 'Back to Skills')}
        </button>

        {/* Header */}
        <div className="bg-surface-secondary border border-border rounded-lg p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">{skill.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">{skill.source || 'manual'}</Badge>
                  {skill.enabled ? (
                    <Badge variant="success">{t('skills.enabled', 'Enabled')}</Badge>
                  ) : (
                    <Badge variant="warning">{t('skills.disabled', 'Disabled')}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleToggle} title={skill.enabled ? 'Disable' : 'Enable'}>
                {skill.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                <span className="ml-1">{skill.enabled ? t('skills.disable', 'Disable') : t('skills.enable', 'Enable')}</span>
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                {t('skills.delete', 'Delete')}
              </Button>
            </div>
          </div>

          {skill.description && (
            <p className="text-sm text-text-secondary mt-4">{skill.description}</p>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-surface-secondary border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
              <Calendar size={12} />
              {t('skills.created', 'Created')}
            </div>
            <div className="text-sm text-text-primary">
              {new Date(skill.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-surface-secondary border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
              <Tag size={12} />
              {t('skills.source', 'Source')}
            </div>
            <div className="text-sm text-text-primary">{skill.source || '-'}</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface-secondary border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-3">
            <FileText size={12} />
            {t('skills.content', 'Content')}
          </div>
          <pre className="bg-code border border-border rounded p-4 text-sm text-text-primary overflow-x-auto max-h-[500px] whitespace-pre-wrap font-mono leading-relaxed">
            {skill.content || t('skills.noContent', 'No content available.')}
          </pre>
        </div>
      </div>
    </div>
  )
}
