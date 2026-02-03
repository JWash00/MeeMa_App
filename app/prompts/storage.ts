import type { SavedGeneration } from './types'

const STORAGE_KEY = 'meema_generations'

export async function saveGeneration(gen: SavedGeneration): Promise<void> {
  if (typeof window === 'undefined') return

  const existing = await listGenerations()
  existing.push(gen)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export async function listGenerations(): Promise<SavedGeneration[]> {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedGeneration[]
  } catch {
    return []
  }
}

export async function deleteGeneration(id: string): Promise<void> {
  if (typeof window === 'undefined') return

  const existing = await listGenerations()
  const filtered = existing.filter((g) => g.id !== id)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
