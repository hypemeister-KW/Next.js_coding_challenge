import type * as Party from 'partykit/server'
import { getRandomSentence } from './sentences'

const ROUND_DURATION_MS = 60_000

export type PlayerState = {
  id: string
  name: string
  typedText: string
  wpm: number
  accuracy: number
}

export type RoundState = {
  sentence: string
  roundEndsAt: number
  players: PlayerState[]
}

type ClientMessage =
  | { type: 'join'; playerId: string; name: string }
  | { type: 'progress'; typedText: string; wpm: number; accuracy: number }

function createNewRound(): RoundState {
  return {
    sentence: getRandomSentence(),
    roundEndsAt: Date.now() + ROUND_DURATION_MS,
    players: [],
  }
}

function broadcastState(room: Party.Room, state: RoundState) {
  const message = JSON.stringify({ type: 'state', ...state })
  room.broadcast(message)
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  round: RoundState = createNewRound()
  roundTimer: ReturnType<typeof setInterval> | null = null

  async onStart() {
    this.round = createNewRound()
    this.startRoundTimer()
  }

  startRoundTimer() {
    if (this.roundTimer) clearInterval(this.roundTimer)
    this.roundTimer = setInterval(() => {
      if (Date.now() >= this.round.roundEndsAt) {
        this.startNewRound()
      }
    }, 1000)
  }

  startNewRound() {
    const previousPlayers = this.round.players.map((p) => ({
      id: p.id,
      name: p.name,
      typedText: '',
      wpm: 0,
      accuracy: 100,
    }))
    this.round = {
      ...createNewRound(),
      players: previousPlayers,
    }
    this.startRoundTimer()
    broadcastState(this.room, this.round)
  }

  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {
    connection.setState({ joined: false })
    connection.send(JSON.stringify({ type: 'state', ...this.round }))
  }

  async onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    if (typeof message !== 'string') return
    let msg: ClientMessage
    try {
      msg = JSON.parse(message) as ClientMessage
    } catch {
      return
    }

    if (msg.type === 'join') {
      sender.setState({ playerId: msg.playerId, name: msg.name })
      const stored = await this.room.storage.get<{ wpm: number; accuracy: number }>(
        `player:${msg.playerId}`
      )
      if (stored) {
        sender.send(
          JSON.stringify({ type: 'savedStats', wpm: stored.wpm, accuracy: stored.accuracy })
        )
      }
      const existing = this.round.players.find((p) => p.id === msg.playerId)
      if (existing) {
        existing.typedText = ''
        existing.wpm = 0
        existing.accuracy = 100
      } else {
        this.round.players.push({
          id: msg.playerId,
          name: msg.name,
          typedText: '',
          wpm: 0,
          accuracy: 100,
        })
      }
      broadcastState(this.room, this.round)
      return
    }

    if (msg.type === 'progress') {
      const state = sender.state as { playerId?: string; name?: string } | undefined
      const playerId = state?.playerId
      if (!playerId) return

      const player = this.round.players.find((p) => p.id === playerId)
      if (player) {
        player.typedText = msg.typedText
        player.wpm = msg.wpm
        player.accuracy = msg.accuracy
        broadcastState(this.room, this.round)
      }
    }
  }

  async onClose(connection: Party.Connection) {
    const state = connection.state as { playerId?: string; name?: string } | undefined
    const playerId = state?.playerId
    if (playerId) {
      const player = this.round.players.find((p) => p.id === playerId)
      if (player) {
        await this.room.storage.put(`player:${playerId}`, {
          wpm: player.wpm,
          accuracy: player.accuracy,
        })
      }
      this.round.players = this.round.players.filter((p) => p.id !== playerId)
      broadcastState(this.room, this.round)
    }
  }

  async onError(connection: Party.Connection, error: Error) {
    console.error('Connection error:', error)
  }
}
