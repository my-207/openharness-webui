import { useState, useEffect } from 'react'
import { Sliders, Palette, Type, Keyboard, Mic, Terminal, Cpu, Languages } from 'lucide-react'
import { useSettingsStore } from '../stores/settingsStore'
import { useThemeStore } from '../stores/themeStore'
import { useTranslation } from '../stores/i18nStore'
import type { Lang } from '../stores/i18nStore'
import { Toggle } from '../components/shared/Toggle'
import { Select } from '../components/shared/Select'
import { TextArea } from '../components/shared/Input'
import { Button } from '../components/shared/Button'
import { Spinner } from '../components/shared/Spinner'
import { toast } from '../components/shared/Toast'

const CATEGORIES: { id: string; labelKey: string; icon: any }[] = [
  { id: 'general', labelKey: 'settings.general', icon: Sliders },
  { id: 'theme', labelKey: 'settings.theme', icon: Palette },
  { id: 'output', labelKey: 'settings.output', icon: Type },
  { id: 'keybindings', labelKey: 'settings.keybindings', icon: Keyboard },
  { id: 'vim-voice', labelKey: 'settings.vim-voice', icon: Mic },
  { id: 'advanced', labelKey: 'settings.advanced', icon: Cpu },
]

type CategoryId = (typeof CATEGORIES)[number]['id']

const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
]

export function SettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore()
  const { theme, setTheme } = useThemeStore()
  const { t, lang, setLang } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<CategoryId>('general')

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const update = async (data: Record<string, unknown>) => {
    try {
      await updateSettings(data)
      toast('success', 'Settings updated')
    } catch (err) {
      toast('error', `Failed to update: ${(err as Error).message}`)
    }
  }

  if (loading && !settings) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        <Spinner className="mr-2" /> {t('common.loading')}
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
        Failed to load settings.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scroll-thin">
      <div className="max-w-4xl mx-auto flex gap-6">
        {/* Left nav */}
        <nav className="w-44 shrink-0 space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-surface-tertiary text-text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50'
                }`}
              >
                <Icon size={16} />
                {t(cat.labelKey, cat.labelKey)}
              </button>
            )
          })}
        </nav>

        {/* Right content */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-text-primary mb-6">{t('settings.title')}</h1>

          {/* ─────── General ─────── */}
          {activeCategory === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-primary">{t('settings.effort')}</label>
                <p className="text-xs text-text-tertiary mb-2">Control how much reasoning effort the model applies</p>
                <div className="flex flex-wrap gap-2">
                  {['low', 'medium', 'high', 'max'].map((level) => (
                    <button
                      key={level}
                      onClick={() => update({ effort_level: level })}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        settings.effort_level === level
                          ? 'bg-primary text-white'
                          : 'bg-surface-tertiary text-text-secondary border border-border hover:border-primary/50'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary">{t('settings.maxTurns')}</label>
                <p className="text-xs text-text-tertiary mb-2">Maximum conversation turns before stopping</p>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={settings.max_turns}
                  onChange={(e) => update({ max_turns: parseInt(e.target.value, 10) || 1 })}
                  className="w-24 bg-surface-tertiary border border-border rounded px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-3">
                <Toggle checked={settings.fast_mode} onChange={(v) => update({ fast_mode: v })} label={t('settings.fastMode')} />
                <Toggle checked={settings.auto_compact} onChange={(v) => update({ auto_compact: v })} label={t('settings.autoCompact')} />
                <Toggle checked={settings.verbose} onChange={(v) => update({ verbose: v })} label={t('settings.verbose')} />
              </div>

              {/* Language selector in General section */}
              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Languages size={16} />
                  {t('settings.language')}
                </label>
                <p className="text-xs text-text-tertiary mb-2">Switch interface language</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLang(l.value)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        lang === l.value
                          ? 'bg-primary text-white ring-2 ring-primary/40'
                          : 'bg-surface-tertiary text-text-secondary border border-border hover:border-primary/50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── Theme ─────── */}
          {activeCategory === 'theme' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-primary">{t('settings.theme')}</label>
                <p className="text-xs text-text-tertiary mb-3">
                  {t('settings.theme')}: <span className="text-primary font-mono">{theme}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-6 py-3 rounded text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-primary text-white ring-2 ring-primary/40'
                        : 'bg-surface-tertiary text-text-secondary border border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">🌙</div>
                    <div>{t('settings.theme.dark')}</div>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-6 py-3 rounded text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-primary text-white ring-2 ring-primary/40'
                        : 'bg-surface-tertiary text-text-secondary border border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">☀️</div>
                    <div>{t('settings.theme.light')}</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────── Output ─────── */}
          {activeCategory === 'output' && (
            <div className="space-y-5">
              <Select
                label={t('settings.outputStyle')}
                value={settings.output_style}
                onChange={(e) => update({ output_style: e.target.value })}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'detailed', label: 'Detailed' },
                  { value: 'markdown', label: 'Markdown' },
                ]}
              />
            </div>
          )}

          {/* ─────── Keybindings ─────── */}
          {activeCategory === 'keybindings' && (
            <div className="p-6 bg-surface-secondary border border-border rounded-lg text-center">
              <Keyboard size={32} className="mx-auto mb-3 text-text-tertiary" />
              <p className="text-sm text-text-secondary">Keybindings configuration coming soon.</p>
              <p className="text-xs text-text-tertiary mt-1">Manage keyboard shortcuts for common actions.</p>
            </div>
          )}

          {/* ─────── Vim / Voice ─────── */}
          {activeCategory === 'vim-voice' && (
            <div className="space-y-4">
              <Toggle checked={settings.vim_mode} onChange={(v) => update({ vim_mode: v })} label={t('settings.vimMode')} />
              <Toggle checked={settings.voice_mode} onChange={(v) => update({ voice_mode: v })} label={t('settings.voiceMode')} />
            </div>
          )}

          {/* ─────── Advanced ─────── */}
          {activeCategory === 'advanced' && (
            <div className="space-y-5">
              <Toggle checked={settings.debug_mode} onChange={(v) => update({ debug_mode: v })} label={t('settings.debugMode')} />
              <Toggle checked={settings.bare_mode} onChange={(v) => update({ bare_mode: v })} label={t('settings.bareMode')} />

              <div>
                <TextArea
                  label={t('settings.systemPrompt')}
                  value={settings.system_prompt}
                  onChange={(e) => update({ system_prompt: e.target.value })}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
