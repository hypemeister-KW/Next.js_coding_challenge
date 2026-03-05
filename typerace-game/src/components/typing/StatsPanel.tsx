'use client'

import { theme } from '../../lib/theme'

type Props = {
  progress: number
  correctChars: number
  typedChars: number
  wpm: number
  accuracy: number
  savedStats?: { wpm: number; accuracy: number } | null
}

const StatItem = ({
  label,
  value,
  active,
}: {
  label: string
  value: string | number
  active?: boolean
}) => (
  <span
    className="px-3 py-1.5 rounded-md font-mono text-sm transition-colors"
    style={{
      backgroundColor: active ? theme.bg.muted : 'transparent',
      color: active ? theme.text.correct : theme.text.muted,
    }}
  >
    {label}: {value}
  </span>
)

export function StatsPanel({
  progress,
  correctChars,
  typedChars,
  wpm,
  accuracy,
  savedStats,
}: Props) {
  return (
    <div className="w-full">
      <div
        className="flex flex-wrap items-center gap-1 py-3 px-4 rounded-t-lg"
        style={{ backgroundColor: theme.bg.main }}
      >
        <StatItem label="progress" value={`${progress}%`} active />
        <StatItem label="correctChars" value={correctChars} />
        <StatItem label="typedChars" value={typedChars} />
        <span
          className="w-px h-4 mx-1"
          style={{ backgroundColor: theme.border.default }}
        />
        <StatItem label="wpm" value={wpm} />
        <StatItem label="accuracy" value={`${accuracy}%`} />
        {savedStats && (
          <>
            <span
              className="w-px h-4 mx-1"
              style={{ backgroundColor: theme.border.default }}
            />
            <StatItem label="last round" value={`${savedStats.wpm} wpm · ${savedStats.accuracy.toFixed(1)}%`} />
          </>
        )}
      </div>
      <div
        className="w-full h-px"
        style={{ backgroundColor: theme.border.default }}
      />
    </div>
  )
}
