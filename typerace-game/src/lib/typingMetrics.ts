export function computeWpm(
  typedText: string,
  expectedText: string,
  startTime: number | null,
  elapsedMinutes?: number
): number {
  if (expectedText.length === 0) return 0
  const minutes =
    elapsedMinutes !== undefined
      ? elapsedMinutes
      : startTime
        ? (Date.now() - startTime) / 60_000
        : 0
  if (minutes <= 0) return 0

  const expectedWords = expectedText.trim().split(/\s+/).filter(Boolean)
  const typedWords = typedText.trim().split(/\s+/).filter(Boolean)
  let correctWords = 0
  for (let i = 0; i < expectedWords.length && i < typedWords.length; i++) {
    if (expectedWords[i] === typedWords[i]) correctWords++
  }

  return Math.round((correctWords / minutes) * 10) / 10
}

export function computeAccuracy(typedText: string, expectedText: string): number {
  if (expectedText.length === 0) return 100
  if (typedText.length === 0) return 100
  let correct = 0
  for (let i = 0; i < typedText.length && i < expectedText.length; i++) {
    if (typedText[i] === expectedText[i]) correct++
  }
  return Math.round((correct / expectedText.length) * 1000) / 10
}
