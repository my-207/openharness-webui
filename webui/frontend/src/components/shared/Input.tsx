import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <input
        className={clsx(
          'w-full bg-surface-tertiary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors',
          'focus:border-primary focus:ring-1 focus:ring-primary/30',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, className, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <textarea
        className={clsx(
          'w-full bg-surface-tertiary border border-border rounded px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none resize-none transition-colors',
          'focus:border-primary focus:ring-1 focus:ring-primary/30',
          className,
        )}
        {...props}
      />
    </div>
  )
}
