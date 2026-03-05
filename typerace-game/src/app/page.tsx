'use client'

import { useState, useCallback } from 'react'
import { useTypingTest } from '../hooks/useTypingTest'
import { TextDisplay, TypingInput, StatsPanel } from '../components/typing'
import { theme } from '../lib/theme'

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const handleRestart = useCallback(() => setIsStarted(false), [])
  const {
    typedText,
    expectedText,
    inputRef,
    handleKeyDown,
    handleInput,
    restart,
    wpm,
    accuracy,
    progress,
    correctChars,
    typedChars,
  } = useTypingTest({ onRestart: handleRestart })

  const handleRestartClick = useCallback(() => {
    restart()
    handleRestart()
  }, [restart, handleRestart])

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4"
      style={{ backgroundColor: theme.bg.main }}
    >
      <div className="w-full max-w-4xl pt-6">
        <StatsPanel
          progress={progress}
          correctChars={correctChars}
          typedChars={typedChars}
          wpm={wpm}
          accuracy={accuracy}
        />
      </div>
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="relative w-full min-h-[140px] flex items-center justify-center">
          <div
            className={`w-full max-w-4xl transition-[filter] duration-300 ${!isStarted ? 'blur-md select-none' : ''}`}
          >
            <TextDisplay expectedText={expectedText} typedText={typedText} />
          </div>
          {!isStarted && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              onClick={() => {
                setIsStarted(true)
                inputRef.current?.focus()
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsStarted(true)
                  inputRef.current?.focus()
                }
              }}
            >
              <p className="font-mono text-2xl text-white">
                click to start a game
              </p>
            </div>
          )}
          <TypingInput
            value={typedText}
            inputRef={inputRef}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl flex items-center justify-center py-6 border-t" style={{ borderColor: theme.border.default }}>
        <div className="flex items-center gap-6 font-mono text-sm" style={{ color: theme.text.muted }}>
          <button
            type="button"
            onClick={handleRestartClick}
            className="hover:opacity-80"
          >
            Restart
          </button>
          <span className="text-xs" style={{ color: theme.text.muted }}>
            tab · esc · enter
          </span>
        </div>
      </div>
    </main>
  )
}
