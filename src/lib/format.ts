export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`
  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function formatCurrency(n: number | null): string {
  if (n === null) return 'PM to discuss'
  return `$${n.toFixed(2)}`
}

export function formatDepartDisplay(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

