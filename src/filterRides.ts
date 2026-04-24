import type {
  Location,
  Ride,
  RidePool,
  SortDir,
} from './types'

export type RideFilters = {
  /** Inclusive start of day (local), YYYY-MM-DD or empty */
  dateFrom: string
  /** Inclusive end of day (local), YYYY-MM-DD or empty */
  dateTo: string
  departure: Location | ''
  arrival: Location | ''
  /** Driver: min seats remaining; Passenger: max seats needed */
  seatThreshold: string
  /** Driver: min luggage remaining; Passenger: max luggage needed */
  luggageThreshold: string
  sortDir: SortDir
}

function startOfDayMs(dateYmd: string): number {
  const [y, m, d] = dateYmd.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
}

function endOfDayMs(dateYmd: string): number {
  const [y, m, d] = dateYmd.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
}

export function filterAndSortRides(
  rides: Ride[],
  pool: RidePool,
  f: RideFilters,
): Ride[] {
  const poolRides = rides.filter((r) => r.role === pool)

  const filtered = poolRides.filter((r) => {
    const t = new Date(r.departAt).getTime()

    if (f.dateFrom) {
      if (t < startOfDayMs(f.dateFrom)) return false
    }
    if (f.dateTo) {
      if (t > endOfDayMs(f.dateTo)) return false
    }
    if (f.departure && r.departure !== f.departure) return false
    if (f.arrival && r.arrival !== f.arrival) return false

    const seatN = f.seatThreshold === '' ? NaN : Number(f.seatThreshold)
    if (!Number.isNaN(seatN)) {
      if (pool === 'driver' && r.role === 'driver') {
        if (r.seatsRemaining < seatN) return false
      }
      if (pool === 'passenger' && r.role === 'passenger') {
        if (r.seatsNeeded > seatN) return false
      }
    }

    const lugN = f.luggageThreshold === '' ? NaN : Number(f.luggageThreshold)
    if (!Number.isNaN(lugN)) {
      if (pool === 'driver' && r.role === 'driver') {
        if (r.luggageRemaining < lugN) return false
      }
      if (pool === 'passenger' && r.role === 'passenger') {
        if (r.luggageNeeded > lugN) return false
      }
    }

    return true
  })

  const mul = f.sortDir === 'asc' ? 1 : -1
  return [...filtered].sort(
    (a, b) =>
      mul * (new Date(a.departAt).getTime() - new Date(b.departAt).getTime()),
  )
}
