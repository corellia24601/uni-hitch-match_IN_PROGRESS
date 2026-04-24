import { describe, expect, test } from 'vitest'
import { canReserve, contactVisible } from '../lib/domain'
import type { ChatThread, DriverRide } from '../types'

function makeRide(): DriverRide {
  return {
    id: 'r1',
    createdAt: new Date().toISOString(),
    departAt: new Date().toISOString(),
    ownerUserId: 'u1',
    departure: 'UIUC',
    arrival: 'ORD',
    pickupDetail: '',
    dropoffDetail: '',
    notes: '',
    flexibleMinutes: 10,
    allowPets: false,
    allowSmoking: false,
    musicPreference: 'light',
    cancellationPolicy: 'flexible',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    lifecycle: 'open',
    role: 'driver',
    seatsTotal: 3,
    seatsRemaining: 2,
    luggageTotal: 2,
    luggageRemaining: 1,
    pricePerPersonNoLuggage: 20,
    pricePerLuggage: 5,
    pricePm: false,
  }
}

describe('capacity locking', () => {
  test('allows valid reservation only', () => {
    const ride = makeRide()
    expect(canReserve(ride, 1, 1)).toBe(true)
    expect(canReserve(ride, 3, 1)).toBe(false)
    expect(canReserve(ride, 1, 2)).toBe(false)
    expect(canReserve(ride, 0, 0)).toBe(false)
  })
})

describe('contact privacy', () => {
  test('requires mutual consent in direct thread', () => {
    const t: ChatThread = {
      id: 't1',
      kind: 'direct',
      title: 'x',
      rideId: 'r1',
      memberUserIds: ['u1', 'u2'],
      createdByUserId: 'u1',
      createdAt: new Date().toISOString(),
      lifecycle: 'interested',
      contactConsentByUserIds: ['u1'],
      rideConfirmedByUserIds: [],
    }
    expect(contactVisible(t)).toBe(false)
    t.contactConsentByUserIds.push('u2')
    expect(contactVisible(t)).toBe(true)
  })
})

