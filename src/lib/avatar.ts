const PALETTE = [
  '#2563eb',
  '#ea580c',
  '#0891b2',
  '#db2777',
  '#10b981',
  '#9333ea',
  '#f59e0b',
  '#ef4444',
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function avatarColor(key: string | null | undefined): string {
  if (!key) return PALETTE[0]
  return PALETTE[hashString(key) % PALETTE.length]
}

export function avatarInitial(nameOrHandle: string | null | undefined): string {
  if (!nameOrHandle) return '?'
  const trimmed = nameOrHandle.replace(/^@/, '').trim()
  if (!trimmed) return '?'
  return trimmed[0].toUpperCase()
}
