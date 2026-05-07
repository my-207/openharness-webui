import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageList } from '../components/chat/MessageList'
import { ChatInput } from '../components/chat/ChatInput'
import { RightPanel } from '../components/chat/RightPanel'
import { PermissionModal } from '../components/chat/PermissionModal'
import { useChatStore } from '../stores/chatStore'

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const newSession = useChatStore((s) => s.newSession)
  const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId)
  const restoreTranscript = useChatStore((s) => s.restoreTranscript)
  const currentSessionId = useChatStore((s) => s.currentSessionId)
  const restored = useRef(false)

  // On mount: check for ?session=xxx to restore a history session
  useEffect(() => {
    if (restored.current) return
    restored.current = true

    const sessionParam = searchParams.get('session')
    if (sessionParam) {
      // Restore from history session
      fetch(`/api/sessions/${sessionParam}`)
        .then((r) => r.json())
        .then((session) => {
          if (session?.transcript) {
            restoreTranscript(session.transcript)
          }
          setCurrentSessionId(sessionParam)
        })
        .catch(() => {
          // Session not found — create a new one
          newSession()
        })
    } else if (!currentSessionId) {
      // Fresh page with no session — create one
      newSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <MessageList />
        <ChatInput />
      </div>

      {/* Right info panel */}
      <RightPanel />

      {/* Permission modal (global) */}
      <PermissionModal />
    </div>
  )
}
