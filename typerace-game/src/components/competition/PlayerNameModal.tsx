'use client'

import { useState, useCallback, useEffect } from 'react'
import { theme } from '@/lib/theme'

const STORAGE_KEY = 'typerace-player-name'

export function getStoredPlayerName(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredPlayerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
  }
}

type Props = {
  onJoin: (name: string) => void
}

export function PlayerNameModal({ onJoin }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = getStoredPlayerName()
    if (stored) setName(stored)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = name.trim()
      if (!trimmed) {
        setError('Please enter your name')
        return
      }
      if (trimmed.length > 32) {
        setError('Name must be 32 characters or less')
        return
      }
      setError('')
      setStoredPlayerName(trimmed)
      onJoin(trimmed)
    },
    [name, onJoin]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-name-title"
    >
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: theme.bg.main, border: `1px solid ${theme.border.default}` }}
      >
        <h2 id="player-name-title" className="font-mono text-lg mb-4" style={{ color: theme.text.correct }}>
          Join the competition
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="player-name" className="block font-mono text-sm mb-2" style={{ color: theme.text.muted }}>
              Your name
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="super typer"
              maxLength={32}
              autoFocus
              className="w-full px-4 py-2 rounded font-mono text-sm"
              style={{
                backgroundColor: theme.bg.muted,
                color: theme.text.correct,
                border: `1px solid ${theme.border.default}`,
              }}
            />
            {error && (
              <p className="mt-1 font-mono text-xs" style={{ color: theme.text.incorrect }}>
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded font-mono text-sm hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: theme.cursor,
              color: theme.bg.main,
            }}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  )
}
