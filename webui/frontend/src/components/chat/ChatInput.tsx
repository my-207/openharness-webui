import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Square } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useTranslation } from '../../stores/i18nStore'

export function ChatInput() {
  const [input, setInput] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const [commandFilter, setCommandFilter] = useState('')
  const [selectedCmd, setSelectedCmd] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sendRequest = useChatStore((s) => s.sendRequest)
  const setBusy = useChatStore((s) => s.setBusy)
  const busy = useChatStore((s) => s.busy)
  const commands = useChatStore((s) => s.commands)
  const connected = useChatStore((s) => s.connected)
  const modal = useChatStore((s) => s.modal)
  const { t } = useTranslation()

  const filteredCommands = showCommands
    ? commands.filter((c) => c.startsWith(`/${commandFilter}`)).slice(0, 10)
    : []

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || busy || !connected) return
    const sent = sendRequest({ type: 'submit_line', line: trimmed })
    if (sent) {
      setInput('')
      setShowCommands(false)
      setBusy(true)
    }
  }, [input, busy, connected, sendRequest, setBusy])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (showCommands && filteredCommands.length > 0) {
          e.preventDefault()
          const cmd = filteredCommands[selectedCmd]
          if (cmd) {
            setInput(cmd + ' ')
            setShowCommands(false)
            setCommandFilter('')
            setSelectedCmd(0)
          }
        }
        return
      }
      if (e.key === 'Escape') {
        setShowCommands(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showCommands, filteredCommands, selectedCmd])

  const handleInputChange = (value: string) => {
    setInput(value)
    if (value.startsWith('/')) {
      setShowCommands(true)
      setCommandFilter(value.slice(1))
      setSelectedCmd(0)
    } else {
      setShowCommands(false)
    }
  }

  // Disable input when modal is shown
  if (modal) return null

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      {/* Command picker */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="mb-2 border border-border rounded-lg bg-surface-secondary overflow-hidden max-h-48 overflow-y-auto">
          {filteredCommands.map((cmd, i) => (
            <div
              key={cmd}
              className={`px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                i === selectedCmd
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
              onMouseEnter={() => setSelectedCmd(i)}
              onClick={() => {
                setInput(cmd + ' ')
                setShowCommands(false)
                inputRef.current?.focus()
              }}
            >
              {cmd}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={connected ? t('chat.placeholder') : t('chat.connecting')}
          disabled={!connected || busy}
          rows={1}
          className="flex-1 bg-surface-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none resize-none transition-colors focus:border-primary/50 min-h-[36px] max-h-[150px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              const trimmed = input.trim()
              if (!trimmed || busy || !connected) return
              const sent = sendRequest({ type: 'submit_line', line: trimmed })
              if (sent) {
                setInput('')
                setShowCommands(false)
                setBusy(true)
              }
            }
          }}
        />

        {busy ? (
          <button
            onClick={() => { sendRequest({ type: 'interrupt' }); setBusy(false) }}
            className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-red-500/10 transition-colors"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || !connected}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="mt-1.5 text-[11px] text-text-tertiary flex gap-3">
        <span><kbd className="text-text-secondary">{t('chat.enterSend')}</kbd></span>
        <span><kbd className="text-text-secondary">{t('chat.shiftNewline')}</kbd></span>
        <span><kbd className="text-text-secondary">/</kbd> {t('chat.commands')}</span>
        <span><kbd className="text-text-secondary">{t('chat.escStop')}</kbd></span>
      </div>
    </div>
  )
}
