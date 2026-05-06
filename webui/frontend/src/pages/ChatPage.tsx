import { MessageList } from '../components/chat/MessageList'
import { ChatInput } from '../components/chat/ChatInput'
import { RightPanel } from '../components/chat/RightPanel'
import { PermissionModal } from '../components/chat/PermissionModal'

export function ChatPage() {
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
