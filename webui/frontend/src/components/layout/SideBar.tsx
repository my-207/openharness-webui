import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  MessageSquare,
  History,
  Wrench,
  Brain,
  Plug,
  ListTodo,
  Users,
  Clock,
  Bot,
  Settings,
  Key,
  GitBranch,
  Info,
  MemoryStick,
  Shield,
} from 'lucide-react'
import { useTranslation } from '../../stores/i18nStore'

interface SideBarProps {
  collapsed: boolean
}

const navItems = [
  { to: '/chat', icon: MessageSquare, labelKey: 'nav.chat', exact: true },
  { to: '/sessions', icon: History, labelKey: 'nav.history' },
  { to: '/providers', icon: Settings, labelKey: 'nav.providers' },
  { to: '/tools', icon: Wrench, labelKey: 'nav.tools' },
  { to: '/skills', icon: Brain, labelKey: 'nav.skills' },
  { to: '/memory', icon: MemoryStick, labelKey: 'nav.memory' },
  { to: '/permissions', icon: Shield, labelKey: 'nav.permissions' },
  { to: '/tasks', icon: ListTodo, labelKey: 'nav.tasks' },
  { to: '/plugins', icon: Plug, labelKey: 'nav.plugins' },
  { to: '/swarm', icon: Users, labelKey: 'nav.swarm' },
  { to: '/cron', icon: Clock, labelKey: 'nav.cron' },
  { to: '/autopilot', icon: Bot, labelKey: 'nav.autopilot' },
]

const bottomItems = [
  { to: '/auth', icon: Key, labelKey: 'nav.auth' },
  { to: '/bridge', icon: GitBranch, labelKey: 'nav.bridge' },
  { to: '/ohmo', icon: MessageSquare, labelKey: 'nav.ohmo' },
  { to: '/about', icon: Info, labelKey: 'nav.about' },
]

export function SideBar({ collapsed }: SideBarProps) {
  const { t } = useTranslation()

  return (
    <nav
      className={clsx(
        'border-r border-border bg-surface shrink-0 flex flex-col transition-all duration-200',
        collapsed ? 'w-12' : 'w-44',
      )}
    >
      {/* New chat button */}
      <NavLink
        to="/chat"
        className={clsx(
          'mx-2 mt-2 mb-3 flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors',
          'bg-primary/10 text-primary hover:bg-primary/20',
          collapsed && 'justify-center px-0',
        )}
      >
        <MessageSquare size={16} />
        {!collapsed && <span>{t('nav.newChat')}</span>}
      </NavLink>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              <Icon size={16} />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          )
        })}
      </div>

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5 px-2 pb-2 border-t border-border pt-2">
        {bottomItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              <Icon size={16} />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
