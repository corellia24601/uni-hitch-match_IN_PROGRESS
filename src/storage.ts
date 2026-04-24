import type { AppData } from './types'

const STORAGE_KEY = 'uiuc-rides-board-v3'

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null
    // Defensive defaults for any missing fields added in newer schema versions
    const safe: AppData = {
      users: [],
      rides: [],
      threads: [],
      messages: [],
      reads: [],
      savedSearches: [],
      reservations: [],
      auditEvents: [],
      notificationPrefs: [],
      notificationEvents: [],
      nextAccountNumber: 2,
      ...(parsed as Partial<AppData>),
    }
    return safe
  } catch {
    return null
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearAppData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
