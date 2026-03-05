'use client'

import { theme } from '@/lib/theme'

type Props = {
  message?: string
}

export function LoadingState({ message = 'Connecting...' }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12"
      style={{ color: theme.text.muted }}
    >
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{
          borderColor: theme.border.default,
          borderTopColor: theme.cursor,
        }}
        aria-hidden
      />
      <p className="font-mono text-sm">{message}</p>
    </div>
  )
}
