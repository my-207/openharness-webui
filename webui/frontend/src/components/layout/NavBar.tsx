import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Settings, Zap, Menu } from 'lucide-react'
import { useProviderStore } from '../../stores/providerStore'
import { useTranslation } from '../../stores/i18nStore'

interface NavBarProps {
  onToggleSidebar: () => void
}

export function NavBar({ onToggleSidebar }: NavBarProps) {
  const location = useLocation()
  const { profiles, fetchProfiles, switchProfile } = useProviderStore()
  const { t } = useTranslation()

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const activeProfile = useMemo(() => profiles.find((p) => p.active), [profiles])

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value
    if (name) switchProfile(name)
  }

  return (
    <header className="h-12 border-b border-border bg-surface flex items-center px-4 gap-3 shrink-0">
      {/* Menu toggle */}
      <button onClick={onToggleSidebar} className="text-text-secondary hover:text-text-primary transition-colors">
        <Menu size={20} />
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <Zap size={20} className="text-primary" />
        <span className="text-sm font-semibold text-text-primary">{t('app.name')}</span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <input
          placeholder="Search sessions, commands..."
          className="w-full bg-surface-tertiary border border-border rounded px-3 py-1.5 text-xs text-text-secondary placeholder-text-tertiary outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Model selector — synced with provider profiles */}
      <select
        className="bg-surface-tertiary border border-border rounded px-2 py-1.5 text-xs text-text-primary outline-none cursor-pointer hover:border-border/80 max-w-[200px]"
        value={activeProfile?.name ?? ''}
        onChange={handleModelChange}
      >
        {profiles.length === 0 && (
          <option value="">No providers configured</option>
        )}
        {profiles.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name} — {p.model}
          </option>
        ))}
      </select>

      {/* Settings */}
      <Link
        to="/settings"
        className={`p-1.5 rounded transition-colors ${
          location.pathname === '/settings'
            ? 'text-primary bg-primary/10'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
        }`}
      >
        <Settings size={18} />
      </Link>
    </header>
  )
}
