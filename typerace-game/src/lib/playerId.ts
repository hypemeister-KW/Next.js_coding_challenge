const STORAGE_KEY = 'typerace-player-id'

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}
