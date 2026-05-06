import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldAlert, List, Ban, Plus, X } from 'lucide-react'
import { usePermissionsStore } from '../stores/permissionsStore'
import { Button } from '../components/shared/Button'
import { Input } from '../components/shared/Input'
import { Select } from '../components/shared/Select'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'

interface PathRule {
  pattern: string
  path: string
  allow: boolean
}

const MODES = [
  {
    id: 'default',
    label: 'Default',
    description: 'Ask before each action',
    icon: Shield,
    color: 'blue',
  },
  {
    id: 'plan',
    label: 'Plan',
    description: 'Plan mode — review before write',
    icon: ShieldCheck,
    color: 'yellow',
  },
  {
    id: 'auto',
    label: 'Auto',
    description: 'Full auto — trust the AI',
    icon: ShieldAlert,
    color: 'green',
  },
] as const

const MODE_COLORS: Record<string, string> = {
  blue: 'border-blue-500/40 bg-blue-500/5',
  yellow: 'border-amber-500/40 bg-amber-500/5',
  green: 'border-emerald-500/40 bg-emerald-500/5',
}

const MODE_ACTIVE_COLORS: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30',
  yellow: 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30',
  green: 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30',
}

export function PermissionsPage() {
  const { config, loading, fetchPermissions, updatePermissions } = usePermissionsStore()
  const [newDeniedCmd, setNewDeniedCmd] = useState('')
  const [newAllowedTool, setNewAllowedTool] = useState('')
  const [newDisallowedTool, setNewDisallowedTool] = useState('')
  const [pathRules, setPathRules] = useState<PathRule[]>([])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  useEffect(() => {
    if (config) {
      setPathRules(
        (config.path_rules || []).map((r) => {
          if (typeof r === 'string') {
            const [pattern = '', path = ''] = r.split('|')
            return { pattern, path, allow: true }
          }
          return { pattern: '', path: '', allow: true }
        }),
      )
    }
  }, [config])

  const setMode = async (mode: string) => {
    try {
      await updatePermissions({ mode })
      toast('success', `Mode set to ${mode}`)
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const addDeniedCommand = async () => {
    const cmd = newDeniedCmd.trim()
    if (!cmd) return
    try {
      const denied_commands = [...(config?.denied_commands || []), cmd]
      await updatePermissions({ denied_commands })
      setNewDeniedCmd('')
      toast('success', 'Command denied')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const removeDeniedCommand = async (cmd: string) => {
    try {
      const denied_commands = (config?.denied_commands || []).filter((c) => c !== cmd)
      await updatePermissions({ denied_commands })
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const addAllowedTool = async () => {
    const tool = newAllowedTool.trim()
    if (!tool) return
    try {
      const allowed_tools = [...(config?.allowed_tools || []), tool]
      await updatePermissions({ allowed_tools })
      setNewAllowedTool('')
      toast('success', 'Tool added to whitelist')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const removeAllowedTool = async (tool: string) => {
    try {
      const allowed_tools = (config?.allowed_tools || []).filter((t) => t !== tool)
      await updatePermissions({ allowed_tools })
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const addDisallowedTool = async () => {
    const tool = newDisallowedTool.trim()
    if (!tool) return
    try {
      const disallowed_tools = [...(config?.disallowed_tools || []), tool]
      await updatePermissions({ disallowed_tools })
      setNewDisallowedTool('')
      toast('success', 'Tool added to blacklist')
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const removeDisallowedTool = async (tool: string) => {
    try {
      const disallowed_tools = (config?.disallowed_tools || []).filter((t) => t !== tool)
      await updatePermissions({ disallowed_tools })
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const addPathRule = () => {
    setPathRules((prev) => [...prev, { pattern: '', path: '', allow: true }])
  }

  const removePathRule = async (idx: number) => {
    const updated = pathRules.filter((_, i) => i !== idx)
    setPathRules(updated)
    try {
      await updatePermissions({ path_rules: updated.map((r) => `${r.pattern}|${r.path}|${r.allow ? 'allow' : 'deny'}`) })
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  const updatePathRule = async (idx: number, field: keyof PathRule, value: string | boolean) => {
    const updated = pathRules.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    setPathRules(updated)
    try {
      await updatePermissions({
        path_rules: updated.map((r) => `${r.pattern}|${r.path}|${r.allow ? 'allow' : 'deny'}`),
      })
    } catch (err) {
      toast('error', `Failed: ${(err as Error).message}`)
    }
  }

  if (loading && !config) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> Loading permissions...
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
        Failed to load permissions.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Shield size={20} /> Permissions
          </h1>
          <p className="text-sm text-text-secondary mt-1">Configure safety and access controls</p>
        </div>

        {/* Mode selector */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Mode</h2>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m) => {
              const isActive = config.mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all ${
                    isActive ? MODE_ACTIVE_COLORS[m.color] : `${MODE_COLORS[m.color]} border-border hover:border-${m.color}-500/30`
                  }`}
                >
                  <m.icon size={28} className={isActive ? `text-${m.color}-400` : 'text-text-tertiary'} />
                  <span className={`text-sm font-medium ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{m.label}</span>
                  <span className="text-xs text-text-tertiary">{m.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Path rules */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <List size={16} /> Path Rules
          </h2>
          <div className="bg-surface-secondary border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Pattern</th>
                  <th className="text-left px-4 py-3 font-medium">Path</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pathRules.map((rule, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-b-0">
                    <td className="px-4 py-2">
                      <input
                        value={rule.pattern}
                        onChange={(e) => updatePathRule(idx, 'pattern', e.target.value)}
                        placeholder="e.g. *.ts"
                        className="w-full bg-surface-tertiary border border-border rounded px-2 py-1 text-sm text-text-primary outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={rule.path}
                        onChange={(e) => updatePathRule(idx, 'path', e.target.value)}
                        placeholder="e.g. /src/**"
                        className="w-full bg-surface-tertiary border border-border rounded px-2 py-1 text-sm text-text-primary outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Select
                        value={rule.allow ? 'allow' : 'deny'}
                        onChange={(e) => updatePathRule(idx, 'allow', e.target.value === 'allow')}
                        options={[
                          { value: 'allow', label: 'Allow' },
                          { value: 'deny', label: 'Deny' },
                        ]}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => removePathRule(idx)}
                        className="text-text-tertiary hover:text-danger transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={addPathRule}>
            <Plus size={14} /> Add Rule
          </Button>
        </section>

        {/* Denied commands */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Ban size={16} /> Denied Commands
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {(config.denied_commands || []).map((cmd) => (
              <span
                key={cmd}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-mono"
              >
                {cmd}
                <button onClick={() => removeDeniedCommand(cmd)} className="hover:text-red-300">
                  <X size={12} />
                </button>
              </span>
            ))}
            {(config.denied_commands || []).length === 0 && (
              <span className="text-xs text-text-tertiary">No denied commands configured.</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. rm -rf"
              value={newDeniedCmd}
              onChange={(e) => setNewDeniedCmd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDeniedCommand()}
            />
            <Button variant="primary" size="sm" onClick={addDeniedCommand}>
              <Plus size={14} /> Add
            </Button>
          </div>
        </section>

        {/* Tool whitelist / blacklist */}
        <section className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Tool Whitelist
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(config.allowed_tools || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono"
                >
                  {t}
                  <button onClick={() => removeAllowedTool(t)} className="hover:text-emerald-300">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(config.allowed_tools || []).length === 0 && (
                <span className="text-xs text-text-tertiary">All tools allowed by default.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="tool name"
                value={newAllowedTool}
                onChange={(e) => setNewAllowedTool(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAllowedTool()}
              />
              <Button variant="primary" size="sm" onClick={addAllowedTool}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Ban size={16} className="text-red-400" /> Tool Blacklist
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(config.disallowed_tools || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-mono"
                >
                  {t}
                  <button onClick={() => removeDisallowedTool(t)} className="hover:text-red-300">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(config.disallowed_tools || []).length === 0 && (
                <span className="text-xs text-text-tertiary">No blacklisted tools.</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="tool name"
                value={newDisallowedTool}
                onChange={(e) => setNewDisallowedTool(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDisallowedTool()}
              />
              <Button variant="primary" size="sm" onClick={addDisallowedTool}>
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
