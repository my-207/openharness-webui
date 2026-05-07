import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ChatPage } from './pages/ChatPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { SessionsPage } from './pages/SessionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { PermissionsPage } from './pages/PermissionsPage'
import { ToolsPage } from './pages/ToolsPage'
import { SkillsPage } from './pages/SkillsPage'
import { SkillDetailPage } from './pages/SkillDetailPage'
import { MemoryPage } from './pages/MemoryPage'
import { TasksPage } from './pages/TasksPage'
import { PluginsPage } from './pages/PluginsPage'
import { SwarmPage } from './pages/SwarmPage'
import { CronPage } from './pages/CronPage'
import { AutopilotPage } from './pages/AutopilotPage'
import { OhmoPage } from './pages/OhmoPage'
import { AuthPage } from './pages/AuthPage'
import { BridgePage } from './pages/BridgePage'
import { AboutPage } from './pages/AboutPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:name" element={<SkillDetailPage />} />
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/plugins" element={<PluginsPage />} />
        <Route path="/swarm" element={<SwarmPage />} />
        <Route path="/cron" element={<CronPage />} />
        <Route path="/autopilot" element={<AutopilotPage />} />
        <Route path="/ohmo" element={<OhmoPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bridge" element={<BridgePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
