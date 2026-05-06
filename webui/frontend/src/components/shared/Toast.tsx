import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let toastId = 0
const listeners: Array<(toast: ToastItem) => void> = []

export function toast(type: ToastType, message: string) {
  const item: ToastItem = { id: ++toastId, type, message }
  listeners.forEach((fn) => fn(item))
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id))
      }, 4000)
    }
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  }, [])

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400" />,
    error: <AlertCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-blue-400" />,
  }

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded shadow-lg text-sm animate-in slide-in-from-right',
            'bg-surface-secondary border border-border',
          )}
        >
          {icons[item.type]}
          <span className="text-text-primary text-sm">{item.message}</span>
          <button onClick={() => remove(item.id)} className="ml-2 text-text-tertiary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
