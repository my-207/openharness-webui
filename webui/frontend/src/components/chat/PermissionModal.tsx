import { useEffect } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

export function PermissionModal() {
  const modal = useChatStore((s) => s.modal)
  const sendRequest = useChatStore((s) => s.sendRequest)
  const setModal = useChatStore((s) => s.setModal)

  useEffect(() => {
    if (!modal || modal.kind !== 'permission') return

    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'y') {
        sendRequest({
          type: 'permission_response',
          request_id: modal.request_id,
          allowed: true,
        })
        setModal(null)
      } else if (key === 'n' || key === 'Escape') {
        sendRequest({
          type: 'permission_response',
          request_id: modal.request_id,
          allowed: false,
        })
        setModal(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modal, sendRequest, setModal])

  if (!modal || modal.kind !== 'permission') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-secondary border border-border rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Shield size={18} className="text-warning" />
          <h2 className="text-sm font-semibold text-text-primary">Permission Request</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-text-secondary mb-1">Tool: <span className="text-text-primary font-mono">{String(modal.tool_name ?? '')}</span></p>
          {Boolean(modal.reason) && (
            <p className="text-sm text-text-secondary mb-3">{String(modal.reason)}</p>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => {
                sendRequest({ type: 'permission_response', request_id: modal.request_id, allowed: false })
                setModal(null)
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-surface-tertiary text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors"
            >
              <X size={14} /> Deny
            </button>
            <button
              onClick={() => {
                sendRequest({ type: 'permission_response', request_id: modal.request_id, allowed: true })
                setModal(null)
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              <Check size={14} /> Allow
            </button>
          </div>
          <div className="mt-3 text-[11px] text-text-tertiary">
            <kbd className="text-text-secondary">y</kbd> allow · <kbd className="text-text-secondary">n</kbd> deny
          </div>
        </div>
      </div>
    </div>
  )
}
