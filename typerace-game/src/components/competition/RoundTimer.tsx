'use client'

import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'

type Props = {
  roundEndsAt: number
}

export function RoundTimer({ roundEndsAt }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const left = Math.max(0, Math.ceil((roundEndsAt - Date.now()) / 1000))
      setSecondsLeft(left)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [roundEndsAt])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <span
      className="font-mono text-sm tabular-nums"
      style={{ color: theme.text.muted }}
      aria-live="polite"
    >
      Next round in {display}
    </span>
  )
}
