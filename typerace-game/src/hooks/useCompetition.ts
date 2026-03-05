'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePartySocket } from 'partysocket/react'

export type PlayerState = {
  id: string
  name: string
  typedText: string
  wpm: number
  accuracy: number
}

const PARTYKIT_HOST =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999')
    : ''

const ROOM_ID = 'lobby'

export type SavedStats = {
  wpm: number
  accuracy: number
}

export type CompetitionState = {
  sentence: string
  roundEndsAt: number
  players: PlayerState[]
  isConnected: boolean
  error: Error | null
  savedStats: SavedStats | null
}

export function useCompetition(playerId: string | null, playerName: string | null) {
  const [state, setState] = useState<CompetitionState>({
    sentence: '',
    roundEndsAt: 0,
    players: [],
    isConnected: false,
    error: null,
    savedStats: null,
  })
  const lastProgressRef = useRef<{ typedText: string; wpm: number; accuracy: number } | null>(null)

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: ROOM_ID,
    party: 'competition',
    onOpen: () => setState((s) => ({ ...s, isConnected: true, error: null })),
    onClose: () => setState((s) => ({ ...s, isConnected: false })),
    onError: (event: Event) =>
      setState((s) => ({
        ...s,
        error: event instanceof ErrorEvent ? new Error(event.message) : new Error('Connection failed'),
      })),
    onMessage: (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string)
        if (data.type === 'state') {
          setState((s) => ({
            ...s,
            sentence: data.sentence ?? '',
            roundEndsAt: data.roundEndsAt ?? 0,
            players: data.players ?? [],
          }))
        } else if (data.type === 'savedStats') {
          setState((s) => ({
            ...s,
            savedStats: { wpm: data.wpm ?? 0, accuracy: data.accuracy ?? 100 },
          }))
        }
      } catch {
      }
    },
  })


  useEffect(() => {
    if (socket.readyState === WebSocket.OPEN && playerId && playerName) {
      socket.send(
        JSON.stringify({
          type: 'join',
          playerId,
          name: playerName,
        })
      )
    }
  }, [socket.readyState, playerId, playerName, socket])

  const sendProgress = useCallback(
    (typedText: string, wpm: number, accuracy: number) => {
      if (!playerId || socket.readyState !== WebSocket.OPEN) return

      const last = lastProgressRef.current
      if (
        last &&
        last.typedText === typedText &&
        last.wpm === wpm &&
        last.accuracy === accuracy
      ) {
        return
      }
      lastProgressRef.current = { typedText, wpm, accuracy }
      socket.send(
        JSON.stringify({
          type: 'progress',
          typedText,
          wpm,
          accuracy,
        })
      )
    },
    [playerId, socket]
  )

  const reconnect = useCallback(() => {
    if ('reconnect' in socket && typeof socket.reconnect === 'function') {
      ; (socket as { reconnect: () => void }).reconnect()
    }
  }, [socket])

  return {
    ...state,
    sendProgress,
    reconnect,
  }
}
