import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useTranslation } from '../../stores/i18nStore'
import { MessageBubble } from './MessageBubble'
import { Spinner } from '../shared/Spinner'

export function MessageList() {
  const transcript = useChatStore((s) => s.transcript)
  const assistantBuffer = useChatStore((s) => s.assistantBuffer)
  const busy = useChatStore((s) => s.busy)
  const busyLabel = useChatStore((s) => s.busyLabel)
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Direct scroll to bottom instead of smooth scrollIntoView.
    // During streaming, smooth animation can't keep up with rapid
    // re-renders, causing the visible area to get stuck mid-way.
    el.scrollTop = el.scrollHeight
  }, [transcript, assistantBuffer])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2 scroll-thin">
      {transcript.length === 0 && !busy && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">{t('chat.welcome')}</h2>
          <p className="text-sm text-text-secondary max-w-md">
            {t('chat.welcomeDesc')}
          </p>
        </div>
      )}

      {transcript.map((item, i) => (
        <MessageBubble key={i} item={item} />
      ))}

      {/* Streaming buffer */}
      {assistantBuffer && (
        <div className="flex gap-2 py-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
            <Bot size={14} className="text-emerald-400" />
          </div>
          <div className="max-w-[75%] text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
            {assistantBuffer}
            <span className="animate-pulse ml-0.5">▊</span>
          </div>
        </div>
      )}

      {/* Busy indicator */}
      {busy && !assistantBuffer && (
        <div className="flex items-center gap-2 py-3 text-sm text-text-tertiary">
          <Spinner />
          <span>{busyLabel ?? t('chat.processing')}</span>
        </div>
      )}
    </div>
  )
}
