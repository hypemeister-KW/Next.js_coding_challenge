# TypeRace – Real-Time Typing Competition

A real-time typing competition platform where players join a shared room, type the same sentence, and compete on words-per-minute (WPM) and accuracy. Built with Next.js 16, PartyKit (WebSockets), and TypeScript.

## Features

- **Real-time competition** – Join a lobby and see live progress of all players
- **Fixed-time rounds** – 60-second rounds with a new sentence each round
- **Live metrics** – WPM (correct words only) and accuracy (correct chars / sentence length)
- **Player persistence** – Stats saved when you disconnect; loaded when you rejoin
- **Sortable, paginated table** – Sort by progress, name, WPM, or accuracy; URL-synced sort
- **Loading & error states** – Clear feedback when connecting or when connection fails

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Real-time**: PartyKit (WebSockets), PartySocket
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest, Testing Library

## Architecture

### Frontend

- `src/app/page.tsx` – Main page; wires competition, typing, and UI
- `src/hooks/useCompetition.ts` – PartyKit WebSocket connection, join/progress messages
- `src/hooks/useSentenceTypingTest.ts` – Typing logic for a single sentence, WPM/accuracy
- `src/lib/typingMetrics.ts` – Pure WPM and accuracy calculations (unit-tested)
- `src/components/competition/` – Round timer, players table, player name modal
- `src/components/typing/` – Text display, input, stats panel

### Backend (PartyKit)

- `party/index.ts` – Competition room server
- `party/sentences.ts` – English sentences for rounds
- Rounds: 60 seconds each, new sentence per round
- Storage: PartyKit storage for per-player stats (last WPM/accuracy)

### Data Flow

1. User enters name → stored in `localStorage`
2. Client connects to PartyKit room `lobby`
3. Server sends current round state (sentence, roundEndsAt, players)
4. User types → client computes WPM/accuracy → sends `progress` to server
5. Server broadcasts updated state to all clients
6. On disconnect, server saves player stats to storage
7. On reconnect, server sends `savedStats` for last round

## Design Choices

### WPM Calculation

- **Correct words only** – Words with any typo are not counted (per challenge spec)
- Word-by-word comparison: `expectedWords[i] === typedWords[i]`

### Accuracy

- **Formula**: `correctChars / expectedText.length`
- Correct chars = characters that match the expected sentence at each position

### Player Identity

- `playerId`: UUID stored in `localStorage` (persists across sessions)
- `playerName`: Stored in `localStorage`; modal on first visit

### Table Sorting & URL

- Sort state (column, direction) and pagination (page, rows) are synced to the URL
- Refreshing the page keeps the same sort and pagination

### Security

- Input validation: player name length (≤32 chars)
- No sensitive data in WebSocket messages
- PartyKit storage is scoped per room

## How to Run

### Prerequisites

- Node.js 18+
- npm

### Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env example (optional; defaults work for local dev):

   ```bash
   cp .env.example .env.local
   ```

3. Run both Next.js and PartyKit:

   ```bash
   npm run dev:all
   ```

   Or run separately:

   ```bash
   npm run dev        # Next.js on http://localhost:3000
   npm run dev:party   # PartyKit on http://localhost:1999
   ```

4. Open [http://localhost:3000]

### Production Build

```bash
npm run build
npm run start
```

PartyKit must be deployed separately (e.g. via `partykit deploy`). Set `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit URL.

### Tests

```bash
npm run test
```

### Lint

```bash
npm run lint
```

## Project Structure

```
typerace-game/
├── party/                 # PartyKit server
│   ├── index.ts          # Competition room logic
│   └── sentences.ts   # Sentence pool
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React components
│   │   ├── competition/  # Round timer, table, modal
│   │   ├── typing/      # Text display, input, stats
│   │   └── ui/         # Loading, error states
│   ├── hooks/           # useCompetition, useSentenceTypingTest
│   └── lib/             # typingMetrics, theme, playerId
├── .env.example
├── package.json
├── partykit.json
├── vitest.config.ts
└── README.md
```

## Assumptions & Simplifications

- **Single room** – All players connect to one lobby (`room: 'lobby'`).
- **Round duration** – Fixed at 60 seconds; configurable in `party/index.ts`.
- **No auth** – Player identity is client-side only (localStorage).
- **Sentences** – Static list in `party/sentences.ts`; no external API.


## License

MIT
