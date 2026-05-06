import { useState } from 'react'
import { Check, Edit3, Trash2, Play, Wifi, Loader2, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import type { ProviderProfile, ConnectionTestResult } from '../../types/protocol'

interface ProviderCardProps {
  profile: ProviderProfile
  onEdit: (profile: ProviderProfile) => void
  onDelete: (name: string) => void
  onSwitch: (name: string) => void
  onTestConnection?: (name: string) => Promise<ConnectionTestResult>
}

export function ProviderCard({ profile, onEdit, onDelete, onSwitch, onTestConnection }: ProviderCardProps) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [modelsExpanded, setModelsExpanded] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<string[]>(profile.allowed_models || [])

  const handleTest = async () => {
    if (!onTestConnection) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await onTestConnection(profile.name)
      setTestResult(result)
      if (result.models && result.models.length > 0) {
        setFetchedModels(result.models)
        setModelsExpanded(true)
      }
    } catch (err) {
      setTestResult({ success: false, message: (err as Error).message, latency_ms: 0, models: [] })
    } finally {
      setTesting(false)
    }
  }

  const models = profile.allowed_models && profile.allowed_models.length > 0
    ? profile.allowed_models
    : fetchedModels

  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      profile.active
        ? 'border-primary/40 bg-primary/5'
        : 'border-border bg-surface-secondary hover:border-border/80'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            profile.configured ? 'bg-emerald-400' : 'bg-amber-400'
          }`} />
          <h3 className="text-sm font-semibold text-text-primary">{profile.name}</h3>
          {profile.active && (
            <Badge variant="success">
              <Check size={10} /> Active
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
            Test
          </Button>
          {!profile.active && (
            <Button size="sm" variant="ghost" onClick={() => onSwitch(profile.name)}>
              <Play size={12} /> Use
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(profile)}>
            <Edit3 size={12} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(profile.name)}>
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-text-secondary">
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-text-tertiary">Provider</span>
          <span className="text-text-primary">{profile.provider}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-text-tertiary">Model</span>
          <span className="text-text-primary font-mono">{profile.model}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-text-tertiary">Auth</span>
          <span className={profile.configured ? 'text-emerald-400' : 'text-amber-400'}>
            {profile.configured ? 'Configured' : 'Missing auth'}
          </span>
        </div>
        {profile.base_url && (
          <div className="flex gap-2">
            <span className="w-20 shrink-0 text-text-tertiary">Base URL</span>
            <span className="text-text-primary font-mono">{profile.base_url}</span>
          </div>
        )}
      </div>

      {/* Test connection result */}
      {testResult && (
        <div className={`mt-3 p-2 rounded text-xs ${
          testResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {testResult.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
            <span className="font-medium">{testResult.success ? 'Connected' : 'Failed'}</span>
            <span className="text-text-tertiary">— {testResult.latency_ms}ms</span>
          </div>
          <p className="text-text-secondary">{testResult.message}</p>
        </div>
      )}

      {/* Models section */}
      {models.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setModelsExpanded(!modelsExpanded)}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {modelsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Available Models ({models.length})</span>
          </button>
          {modelsExpanded && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {models.map((m) => (
                <span key={m} className="px-1.5 py-0.5 bg-surface-tertiary border border-border rounded text-[11px] text-text-secondary font-mono">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
