'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useCompetition } from '@/hooks/useCompetition'
import { useSentenceTypingTest } from '@/hooks/useSentenceTypingTest'
import { TextDisplay, TypingInput, StatsPanel } from '@/components/typing'
import { RoundTimer, PlayersTable, PlayerNameModal, getStoredPlayerName } from '@/components/competition'
import { LoadingState, ErrorState } from '@/components/ui'
import { theme } from '@/lib/theme'
import { getOrCreatePlayerId } from '@/lib/playerId'

export default function Home() {
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [isStarted, setIsStarted] = useState(false)

  const playerId = getOrCreatePlayerId()
  const competition = useCompetition(playerId || null, playerName)

  const sendProgress = useCallback(
    (typedText: string, wpm: number, accuracy: number) => {
      competition.sendProgress(typedText, wpm, accuracy)
    },
    [competition.sendProgress]
  )

  const typing = useSentenceTypingTest({
    sentence: competition.sentence,
    onProgress: sendProgress,
    throttleMs: 150,
  })

  useEffect(() => {
    const stored = getStoredPlayerName()
    if (stored) setPlayerName(stored)
  }, [])

  const handleJoin = useCallback((name: string) => {
    setPlayerName(name)
  }, [])

  const handleRestart = useCallback(() => {
    typing.restart()
    setIsStarted(false)
  }, [typing.restart])

  if (!playerName) {
    return <PlayerNameModal onJoin={handleJoin} />
  }

  if (!competition.isConnected && !competition.error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: theme.bg.main }}
      >
        <LoadingState message="Connecting to competition..." />
      </main>
    )
  }

  if (competition.error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: theme.bg.main }}
      >
        <ErrorState
          message={competition.error.message}
          onRetry={competition.reconnect}
        />
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4"
      style={{ backgroundColor: theme.bg.main }}
    >
      <div className="w-full max-w-4xl pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <StatsPanel
            progress={typing.progress}
            correctChars={typing.correctChars}
            typedChars={typing.typedChars}
            wpm={typing.wpm}
            accuracy={typing.accuracy}
            savedStats={competition.savedStats}
          />
          <RoundTimer roundEndsAt={competition.roundEndsAt} />
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="relative w-full min-h-[140px] flex items-center justify-center">
          <div
            className={`w-full max-w-4xl transition-[filter] duration-300 ${!isStarted ? 'blur-md select-none' : ''}`}
          >
            <TextDisplay expectedText={typing.expectedText} typedText={typing.typedText} />
          </div>
          {!isStarted && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              onClick={() => {
                setIsStarted(true)
                typing.inputRef.current?.focus()
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsStarted(true)
                  typing.inputRef.current?.focus()
                }
              }}
            >
              <p className="font-mono text-2xl" style={{ color: theme.text.correct }}>
                click to start
              </p>
            </div>
          )}
          <TypingInput
            value={typing.typedText}
            inputRef={typing.inputRef}
            onInput={typing.handleInput}
            onKeyDown={typing.handleKeyDown}
          />
        </div>
      </div>

      <div
        className="w-full max-w-4xl py-6 border-t"
        style={{ borderColor: theme.border.default }}
      >
        <h3 className="font-mono text-sm mb-3" style={{ color: theme.text.muted }}>
          Live results
        </h3>
        <Suspense fallback={<div className="py-4 font-mono text-sm" style={{ color: theme.text.muted }}>Loading table...</div>}>
          <PlayersTable players={competition.players} />
        </Suspense>
      </div>

      <div
        className="w-full max-w-4xl flex items-center justify-center py-6 border-t"
        style={{ borderColor: theme.border.default }}
      >
        <div className="flex items-center gap-6 font-mono text-sm" style={{ color: theme.text.muted }}>
          <button type="button" onClick={handleRestart} className="hover:opacity-80">
            Restart
          </button>
          <span className="text-xs">tab · esc to restart</span>
        </div>
      </div>
    </main>
  )
}
