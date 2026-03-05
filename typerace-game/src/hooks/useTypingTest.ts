'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getWords, INITIAL_WORDS } from '@/lib/words'
import { TOTAL_WORDS } from '@/lib/typingConfig'

type UseTypingTestOptions = {
  onRestart?: () => void
}

export function useTypingTest(options?: UseTypingTestOptions) {
  const { onRestart } = options ?? {}
  const [words, setWords] = useState<string[]>(INITIAL_WORDS)
  const [typedText, setTypedText] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const expectedText = words.join(' ')

  const wpm = useMemo(() => {
    if (!startTime || typedText.length === 0) return 0
    const minutes = (Date.now() - startTime) / 60000
    const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length
    return Math.round((wordsTyped / minutes) * 10) / 10
  }, [startTime, typedText])

  const accuracy = useMemo(() => {
    if (typedText.length === 0) return 100
    let correct = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === expectedText[i]) correct++
    }
    return Math.round((correct / typedText.length) * 1000) / 10
  }, [typedText, expectedText])

  const typedChars = typedText.length

  const correctChars = useMemo(() => {
    let correct = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === expectedText[i]) correct++
    }
    return correct
  }, [typedText, expectedText])

  const progress = useMemo(() => {
    if (expectedText.length === 0) return 0
    return Math.round((typedText.length / expectedText.length) * 100)
  }, [typedText.length, expectedText.length])

  useEffect(() => {
    setWords(getWords(TOTAL_WORDS))
  }, [])

  const restart = useCallback(() => {
    setWords(getWords(TOTAL_WORDS))
    setTypedText('')
    setStartTime(null)
    inputRef.current?.focus()
    onRestart?.()
  }, [onRestart])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (['Tab', 'Escape', 'Enter'].includes(e.key)) {
        e.preventDefault()
        restart()
        return
      }

      if (!startTime && typedText.length === 0 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setStartTime(Date.now())
      }

      if (typedText.length >= expectedText.length && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTypedText((prev) => prev.slice(0, -1))
      }
    },
    [restart, startTime, typedText.length, expectedText.length]
  )

  const handleInput = useCallback(
    (value: string) => {
      const sanitized = value.replace(/\n/g, '')
      setTypedText(sanitized.slice(0, expectedText.length))
    },
    [expectedText.length]
  )

  return {
    words,
    typedText,
    expectedText,
    inputRef,
    restart,
    handleKeyDown,
    handleInput,
    wpm,
    accuracy,
    progress,
    correctChars,
    typedChars,
  }
}
