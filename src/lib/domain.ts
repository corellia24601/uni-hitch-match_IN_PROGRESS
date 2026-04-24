import type { ChatThread, DriverRide } from '../types'

export function canReserve(ride: DriverRide, seats: number, luggage: number): boolean {
  if (seats <= 0 || luggage < 0) return false
  return ride.seatsRemaining >= seats && ride.luggageRemaining >= luggage
}

export function contactVisible(thread: ChatThread): boolean {
  return thread.kind === 'direct' && thread.contactConsentByUserIds.length >= 2
}

