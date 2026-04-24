export function startOfWeekMonday(from: Date): Date {
  const d = new Date(from)
  const jsDay = d.getDay()
  const diff = jsDay === 0 ? -6 : 1 - jsDay
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isoPlusDays(base: Date, days: number, hours: number, mins: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(hours, mins, 0, 0)
  return d.toISOString()
}

export function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

