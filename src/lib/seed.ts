import { formatPhone } from './format'
import { isoPlusDays, startOfWeekMonday } from './time'
import type { AppData, Location, NotificationPreference, Ride, User } from '../types'

function accountNo(n: number): string {
  return `A${String(n).padStart(6, '0')}`
}

function toHandle(name: string, accountNumber: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14)
  return `${base || 'user'}${accountNumber.slice(-3)}`
}

export function makeSeedUsers(): User[] {
  const now = new Date().toISOString()
  const names = [
    'Avery Chen',
    'Jordan Patel',
    'Mina Kim',
    'Diego Rivera',
    'Nora Hassan',
    'Lucas Wang',
    'Emma Zhao',
    'Owen Smith',
  ]
  const admin: User = {
    id: crypto.randomUUID(),
    accountNumber: 'A000001',
    name: 'Administrator',
    handle: 'admin001',
    schoolEmail: 'admin@illinois.edu',
    phone: '(217)-300-0001',
    bio: 'System administrator account.',
    isAdmin: true,
    createdAt: now,
  }
  const students = names.map((name, i) => {
    const acct = accountNo(i + 2)
    return {
      id: crypto.randomUUID(),
      accountNumber: acct,
      name,
      handle: toHandle(name, acct),
      schoolEmail: `${name.toLowerCase().replace(/\s+/g, '.')}@illinois.edu`,
      phone: formatPhone(`217333${String(2000 + i).slice(-4)}`),
      bio: i % 2 === 0 ? 'UIUC student and frequent weekend traveler.' : '',
      isAdmin: false,
      createdAt: now,
    } satisfies User
  })
  return [admin, ...students]
}

export function seedRides(users: User[]): Ride[] {
  const base = startOfWeekMonday(new Date())
  const routes: Array<[Location, Location]> = [
    ['UIUC', 'ORD'],
    ['UIUC', 'MDW'],
    ['UIUC', 'Chicago Downtown'],
    ['ORD', 'UIUC'],
    ['MDW', 'UIUC'],
    ['Chicago Downtown', 'UIUC'],
  ]
  const owners = users.filter((u) => !u.isAdmin)
  const common = {
    pickupDetail: 'Main pickup point',
    dropoffDetail: 'Main dropoff point',
    notes: '',
    flexibleMinutes: 15,
    allowPets: false,
    allowSmoking: false,
    musicPreference: 'light' as const,
    cancellationPolicy: 'flexible' as const,
  }
  const drivers: Ride[] = Array.from({ length: 20 }, (_, i) => {
    const [departure, arrival] = routes[i % routes.length]
    const owner = owners[i % owners.length]
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      departAt: isoPlusDays(base, i % 7, 7 + (i % 10), (i * 9) % 60),
      expiresAt: isoPlusDays(base, (i % 7) + 1, 0, 0),
      ownerUserId: owner.id,
      departure,
      arrival,
      role: 'driver',
      lifecycle: 'open',
      seatsRemaining: 1 + (i % 3),
      luggageRemaining: i % 2,
      seatsTotal: 1 + (i % 3),
      luggageTotal: i % 2,
      pricePerPersonNoLuggage: 20 + (i % 5) * 4,
      pricePerLuggage: 5 + (i % 3) * 2,
      pricePm: i % 7 === 0,
      ...common,
    }
  })
  const passengers: Ride[] = Array.from({ length: 20 }, (_, i) => {
    const [arrival, departure] = routes[(i + 1) % routes.length]
    const owner = owners[(i + 2) % owners.length]
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      departAt: isoPlusDays(base, i % 7, 8 + (i % 10), (i * 11) % 60),
      expiresAt: isoPlusDays(base, (i % 7) + 1, 0, 0),
      ownerUserId: owner.id,
      departure,
      arrival,
      role: 'passenger',
      lifecycle: 'open',
      passengerLifecycle: 'searching',
      seatsNeeded: 1 + (i % 2),
      luggageNeeded: i % 2,
      passengerLuggagePrice: 25 + (i % 4) * 6,
      pricePm: i % 6 === 0,
      ...common,
    }
  })
  return [...drivers, ...passengers]
}

function prefs(users: User[]): NotificationPreference[] {
  return users.map((u) => ({
    userId: u.id,
    interest: true,
    confirm: true,
    cancel: true,
  }))
}

export function seedAppData(): AppData {
  const users = makeSeedUsers()
  return {
    users,
    rides: seedRides(users),
    threads: [],
    messages: [],
    reads: [],
    savedSearches: [],
    reservations: [],
    auditEvents: [],
    notificationPrefs: prefs(users),
    notificationEvents: [],
    nextAccountNumber: users.length + 1,
  }
}

