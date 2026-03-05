'use client'

import { useTypingTest } from '../hooks/useTypingTest'
import { TextDisplay, TypingInput } from '../components/typing'
import { theme } from '../lib/theme'

export default function Home() {
  const {
    typedText,
    expectedText,
    inputRef,
    handleKeyDown,
    handleInput,
    restart,
    wpm,
    accuracy,
  } = useTypingTest()

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4"
      style={{ backgroundColor: theme.bg.main }}
    >
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="relative w-full min-h-[140px] flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <TextDisplay expectedText={expectedText} typedText={typedText} />
          </div>
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
          <span>{wpm} wpm</span>
          <span>{accuracy}%</span>
          <span className="mx-2">|</span>
          <button
            type="button"
            onClick={restart}
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
