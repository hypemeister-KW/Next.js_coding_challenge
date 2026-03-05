'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { computeWpm, computeAccuracy } from '@/lib/typingMetrics'

export type UseSentenceTypingTestOptions = {
  sentence: string
  onProgress?: (typedText: string, wpm: number, accuracy: number) => void
  throttleMs?: number
}

export function useSentenceTypingTest({
  sentence,
  onProgress,
  throttleMs = 150,
}: UseSentenceTypingTestOptions) {
  const [typedText, setTypedText] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastProgressRef = useRef<{ typedText: string; wpm: number; accuracy: number } | null>(null)
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const expectedText = sentence

  const wpm = useMemo(
    () => computeWpm(typedText, expectedText, startTime),
    [typedText, expectedText, startTime]
  )

  const accuracy = useMemo(
    () => computeAccuracy(typedText, expectedText),
    [typedText, expectedText]
  )

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
    setTypedText('')
    setStartTime(null)
    lastProgressRef.current = null
  }, [sentence])

  const notifyProgress = useCallback(
    (t: string, w: number, a: number) => {
      const last = lastProgressRef.current
      if (last && last.typedText === t && last.wpm === w && last.accuracy === a) return
      lastProgressRef.current = { typedText: t, wpm: w, accuracy: a }
      onProgress?.(t, w, a)
    },
    [onProgress]
  )

  useEffect(() => {
    if (!onProgress) return
    if (throttleRef.current) clearTimeout(throttleRef.current)
    throttleRef.current = setTimeout(() => {
      notifyProgress(typedText, wpm, accuracy)
      throttleRef.current = null
    }, throttleMs)
    return () => {
      if (throttleRef.current) clearTimeout(throttleRef.current)
    }
  }, [typedText, wpm, accuracy, onProgress, throttleMs, notifyProgress])

  const restart = useCallback(() => {
    setTypedText('')
    setStartTime(null)
    lastProgressRef.current = null
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (['Tab', 'Escape'].includes(e.key)) {
        e.preventDefault()
        restart()
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        return
      }

      if (
        !startTime &&
        typedText.length === 0 &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        setStartTime(Date.now())
      }

      if (
        typedText.length >= expectedText.length &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
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
    typedChars: typedText.length,
  }
}
