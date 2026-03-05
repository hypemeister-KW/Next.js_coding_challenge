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
      className="font-mono text-2xl leading-relaxed select-none text-center max-w-4xl mx-auto whitespace-pre-wrap"
      style={{ color: theme.text.untyped }}
    >
      {visibleLines.map((lineChars, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap items-baseline justify-center whitespace-pre-wrap">
          {lineChars.map((char, charIndex) => (
            <span key={`${lineIndex}-${charIndex}`}>
              {lineIndex === cursorLine && charIndex === cursorOffset && (
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
          ))}
          {lineIndex === cursorLine && cursorOffset === lineChars.length && (
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

function buildLines(expectedText: string, typedText: string): React.ReactNode[][] {
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

  const lines: React.ReactNode[][] = []
  let currentLine: React.ReactNode[] = []
  let wordCount = 0

  for (let i = 0; i < expectedText.length; i++) {
    currentLine.push(chars[i])
    if (expectedText[i] === ' ') {
      wordCount++
      if (wordCount >= WORDS_PER_LINE) {
        lines.push(currentLine)
        currentLine = []
        wordCount = 0
      }
    }
  }
  if (currentLine.length > 0) lines.push(currentLine)

  return lines
}

function getCursorPosition(
  lines: React.ReactNode[][],
  cursorPosition: number
): { lineIdx: number; offset: number } {
  let charCount = 0
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineLength = lines[lineIdx].length
    if (charCount + lineLength >= cursorPosition) {
      return { lineIdx, offset: cursorPosition - charCount }
    }
    charCount += lineLength
  }
  return { lineIdx: lines.length - 1, offset: lines[lines.length - 1]?.length ?? 0 }
}
