import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { SideBar } from './SideBar'
import { StatusBar } from './StatusBar'
import { ToastContainer } from '../shared/Toast'
import { useChatStore } from '../../stores/chatStore'

// Direct connection to backend WebSocket (bypass Vite proxy — more reliable on Windows)
const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/chat`

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const connect = useChatStore((s) => s.connect)
  const connected = useChatStore((s) => s.connected)

  useEffect(() => {
    if (!connected) {
      connect(WS_URL)
    }
    return () => {
      // Don't disconnect on route change — keep session alive
    }
  }, [connected, connect])

  return (
    <div className="h-screen flex flex-col bg-surface">
      <NavBar onToggleSidebar={() => setSidebarCollapsed((c) => !c)} />
      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={sidebarCollapsed} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
      <StatusBar />
      <ToastContainer />
    </div>
  )
}
