'use client'

import { theme } from '../../lib/theme'

const WORDS_PER_LINE = 12
const VISIBLE_LINES = 3

type Props = {
  expectedText: string
  typedText: string
}

export function TextDisplay({ expectedText, typedText }: Props) {
  const lines = buildLines(expectedText, typedText)
  const cursorPosition = typedText.length
  const { lineIdx: cursorLine, offset: cursorOffset } = getCursorPosition(lines, cursorPosition)
  const visibleLines = lines.slice(0, VISIBLE_LINES)

  return (
    <div
      className="font-mono text-2xl leading-relaxed select-none text-center max-w-4xl mx-auto"
      style={{ color: theme.text.untyped }}
    >
      {visibleLines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap items-baseline justify-center">
          {line.words.map((wordChars, wordIndex) => {
            const lineStartCharIdx = line.words
              .slice(0, wordIndex)
              .reduce((sum, w) => sum + w.length, 0)
            return (
              <span key={wordIndex} className="whitespace-nowrap inline-flex">
                {wordChars.map((char, charIndex) => {
                  const charIdx = lineStartCharIdx + charIndex
                  return (
                    <span key={`${lineIndex}-${wordIndex}-${charIndex}`}>
                      {lineIndex === cursorLine && charIdx === cursorOffset && (
                        <span
                          className="inline-block w-3 h-7 align-middle -mb-1 animate-blink"
                          style={{
                            backgroundColor: theme.cursor,
                            marginRight: '2px',
                          }}
                        />
                      )}
                      {char}
                    </span>
                  )
                })}
              </span>
            )
          })}
          {cursorLine === lineIndex && cursorOffset === line.flatChars.length && (
            <span
              className="inline-block w-3 h-7 align-middle -mb-1 ml-0.5 animate-blink"
              style={{ backgroundColor: theme.cursor }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

type Line = { words: React.ReactNode[][]; flatChars: React.ReactNode[] }

function buildLines(expectedText: string, typedText: string): Line[] {
  const chars: React.ReactNode[] = []
  for (let i = 0; i < expectedText.length; i++) {
    const expectedChar = expectedText[i]
    const typedChar = typedText[i]

    const displayChar = expectedChar === ' ' ? '\u00A0' : expectedChar

    if (i < typedText.length) {
      const isCorrect = typedChar === expectedChar
      chars.push(
        <span
          key={i}
          className={isCorrect ? '' : 'underline decoration-2'}
          style={{
            color: isCorrect ? theme.text.correct : theme.text.incorrect,
            textDecorationColor: theme.text.incorrect,
          }}
        >
          {isCorrect ? displayChar : expectedChar === ' ' ? '·' : displayChar}
        </span>
      )
    } else {
      chars.push(
        <span key={i} style={{ color: theme.text.untyped }}>
          {displayChar}
        </span>
      )
    }
  }

  const lines: Line[] = []
  let currentWords: React.ReactNode[][] = []
  let currentWord: React.ReactNode[] = []
  let wordCount = 0

  for (let i = 0; i < expectedText.length; i++) {
    currentWord.push(chars[i])
    if (expectedText[i] === ' ') {
      currentWords.push(currentWord)
      currentWord = []
      wordCount++
      if (wordCount >= WORDS_PER_LINE) {
        lines.push({
          words: currentWords,
          flatChars: currentWords.flat(),
        })
        currentWords = []
        wordCount = 0
      }
    }
  }
  if (currentWord.length > 0) currentWords.push(currentWord)
  if (currentWords.length > 0) {
    lines.push({
      words: currentWords,
      flatChars: currentWords.flat(),
    })
  }

  return lines
}

function getCursorPosition(
  lines: Line[],
  cursorPosition: number
): { lineIdx: number; offset: number } {
  let charCount = 0
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineLength = lines[lineIdx].flatChars.length
    if (charCount + lineLength >= cursorPosition) {
      return { lineIdx, offset: cursorPosition - charCount }
    }
    charCount += lineLength
  }
  const lastLine = lines[lines.length - 1]
  return { lineIdx: lines.length - 1, offset: lastLine?.flatChars.length ?? 0 }
}
