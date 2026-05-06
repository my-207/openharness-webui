import { clsx } from 'clsx'
import { User, Bot, AlertCircle } from 'lucide-react'
import type { TranscriptItem } from '../../types/protocol'

interface MessageBubbleProps {
  item: TranscriptItem
}

export function MessageBubble({ item }: MessageBubbleProps) {
  const isUser = item.role === 'user'
  const isAssistant = item.role === 'assistant'
  const isSystem = item.role === 'system' || item.role === 'log'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-text-tertiary bg-surface-tertiary/50 px-3 py-1 rounded-full">
          {item.text}
        </span>
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 py-2">
        <div className="max-w-[75%] bg-primary/15 text-text-primary rounded-lg rounded-tr-sm px-3 py-2 text-sm leading-relaxed">
          {item.text}
        </div>
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <User size={14} className="text-primary" />
        </div>
      </div>
    )
  }

  if (isAssistant) {
    return (
      <div className="flex gap-2 py-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
          <Bot size={14} className="text-emerald-400" />
        </div>
        <div className="max-w-[75%] text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
          {item.text}
        </div>
      </div>
    )
  }

  // Tool / tool_result
  const isError = item.is_error
  return (
    <div className="flex justify-start py-1">
      <div className={clsx(
        'max-w-[85%] border rounded-lg px-3 py-2 text-xs font-mono',
        isError
          ? 'border-red-800/30 bg-red-950/20 text-red-300'
          : 'border-border bg-surface-tertiary/50 text-text-secondary',
      )}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
            {item.role === 'tool' ? '🔧 Tool' : '📤 Result'}
          </span>
          {item.tool_name && (
            <span className="text-text-primary font-medium">{item.tool_name}</span>
          )}
          {isError && <AlertCircle size={12} className="text-red-400" />}
        </div>
        <div className="whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
          {item.text}
        </div>
      </div>
    </div>
  )
}
