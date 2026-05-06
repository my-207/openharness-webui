import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Input, TextArea } from '../shared/Input'
import { Select } from '../shared/Select'
import { Button } from '../shared/Button'
import type { ProviderProfile } from '../../types/protocol'

interface ProviderFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  editProfile?: ProviderProfile | null
}

const PROVIDER_OPTIONS = [
  { value: 'anthropic', label: 'Anthropic-Compatible API' },
  { value: 'openai', label: 'OpenAI-Compatible API' },
  { value: 'copilot', label: 'GitHub Copilot' },
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'dashscope', label: 'DashScope (Qwen)' },
  { value: 'moonshot', label: 'Moonshot (Kimi)' },
]

const API_FORMAT_OPTIONS = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'copilot', label: 'GitHub Copilot' },
]

const AUTH_SOURCE_OPTIONS = [
  { value: 'anthropic_api_key', label: 'Anthropic API Key' },
  { value: 'openai_api_key', label: 'OpenAI API Key' },
  { value: 'copilot_oauth', label: 'GitHub Copilot OAuth' },
  { value: 'dashscope_api_key', label: 'DashScope API Key' },
  { value: 'moonshot_api_key', label: 'Moonshot API Key' },
]

export function ProviderFormModal({ open, onClose, onSave, editProfile }: ProviderFormModalProps) {
  const isEdit = !!editProfile
  const [form, setForm] = useState({
    name: '',
    label: '',
    provider: 'anthropic',
    api_format: 'anthropic',
    auth_source: 'anthropic_api_key',
    model: '',
    base_url: '',
    api_key: '',
    allowed_models: '',
  })

  useEffect(() => {
    if (editProfile) {
      setForm({
        name: editProfile.name,
        label: editProfile.label,
        provider: editProfile.provider,
        api_format: editProfile.api_format,
        auth_source: editProfile.auth_source,
        model: editProfile.model,
        base_url: editProfile.base_url || '',
        api_key: '',
        allowed_models: (editProfile.allowed_models || []).join(', '),
      })
    } else {
      setForm({
        name: '', label: '', provider: 'anthropic', api_format: 'anthropic',
        auth_source: 'anthropic_api_key', model: '', base_url: '', api_key: '',
        allowed_models: '',
      })
    }
  }, [editProfile, open])

  const handleSubmit = () => {
    onSave({
      name: form.name,
      label: form.label || form.name,
      provider: form.provider,
      api_format: form.api_format,
      auth_source: form.auth_source,
      model: form.model,
      base_url: form.base_url || undefined,
      api_key: form.api_key || undefined,
      allowed_models: form.allowed_models ? form.allowed_models.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Provider Profile' : 'Add Provider Profile'} className="max-w-xl" clickOutsideCloses={false}>
      <div className="space-y-3">
        <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="anthropic" disabled={isEdit} />
        <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Anthropic-Compatible API" />
        <Select label="Provider *" options={PROVIDER_OPTIONS} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="API Format" options={API_FORMAT_OPTIONS} value={form.api_format} onChange={(e) => setForm({ ...form, api_format: e.target.value })} />
          <Select label="Auth Source" options={AUTH_SOURCE_OPTIONS} value={form.auth_source} onChange={(e) => setForm({ ...form, auth_source: e.target.value })} />
        </div>
        <Input label="Model *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="claude-sonnet-4-20250514" />
        <Input label="Base URL" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.anthropic.com" />
        <Input label="API Key" type="password" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder={isEdit ? 'Leave blank to keep existing' : 'sk-ant-...'} />
        <Input label="Allowed Models (comma separated)" value={form.allowed_models} onChange={(e) => setForm({ ...form, allowed_models: e.target.value })} placeholder="sonnet, opus, haiku" />

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name || !form.model}>
            {isEdit ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
