'use client'

import { theme } from '@/lib/theme'

type Props = {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12"
      style={{ color: theme.text.incorrect }}
    >
      <p className="font-mono text-sm text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded font-mono text-sm hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: theme.bg.muted,
            color: theme.text.correct,
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
