export const LOCATIONS = [
  'UIUC',
  'ORD',
  'MDW',
  'Chicago Downtown',
] as const

export type Location = (typeof LOCATIONS)[number]
export type RideRole = 'driver' | 'passenger'
export type RideLifecycle = 'open' | 'full' | 'closed' | 'expired'
export type PassengerLifecycle = 'searching' | 'matched' | 'closed'
export type ThreadLifecycle =
  | 'interested'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

type RideBase = {
  id: string
  createdAt: string
  /** ISO string from Date for the scheduled departure */
  departAt: string
  ownerUserId: string
  departure: Location
  arrival: Location
  pickupDetail: string
  dropoffDetail: string
  notes: string
  flexibleMinutes: number
  allowPets: boolean
  allowSmoking: boolean
  musicPreference: 'quiet' | 'light' | 'any'
  cancellationPolicy: 'flexible' | '2h_notice' | 'strict'
  expiresAt: string
  lifecycle: RideLifecycle
}

export type DriverRide = RideBase & {
  role: 'driver'
  seatsRemaining: number
  luggageRemaining: number
  seatsTotal: number
  luggageTotal: number
  pricePerPersonNoLuggage: number | null
  pricePerLuggage: number | null
  pricePm: boolean
}

export type PassengerRide = RideBase & {
  role: 'passenger'
  passengerLifecycle: PassengerLifecycle
  seatsNeeded: number
  luggageNeeded: number
  passengerLuggagePrice: number | null
  pricePm: boolean
}

export type Ride = DriverRide | PassengerRide

export type SortDir = 'asc' | 'desc'

export type RidePool = 'driver' | 'passenger'

export type User = {
  id: string
  accountNumber: string
  name: string
  handle: string
  schoolEmail: string
  phone: string
  bio: string
  isAdmin: boolean
  createdAt: string
}

export type Session = {
  userId: string
}

export type ChatThread = {
  id: string
  kind: 'direct' | 'group'
  title: string
  rideId: string | null
  memberUserIds: string[]
  createdByUserId: string
  createdAt: string
  lifecycle: ThreadLifecycle
  contactConsentByUserIds: string[]
  rideConfirmedByUserIds: string[]
}

export type ChatMessage = {
  id: string
  threadId: string
  senderUserId: string
  text: string
  createdAt: string
  isSystem: boolean
}

export type MessageRead = {
  id: string
  threadId: string
  userId: string
  lastReadAt: string
}

export type SavedSearch = {
  id: string
  userId: string
  name: string
  pool: RidePool
  dateFrom: string
  dateTo: string
  departure: Location | ''
  arrival: Location | ''
  seatThreshold: string
  luggageThreshold: string
  sortDir: SortDir
  createdAt: string
}

export type Reservation = {
  id: string
  rideId: string
  userId: string
  seatsReserved: number
  luggageReserved: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export type AuditEvent = {
  id: string
  actorUserId: string | null
  targetType:
    | 'ride'
    | 'thread'
    | 'reservation'
    | 'contact_exchange'
    | 'moderation'
    | 'notification'
  targetId: string
  action:
    | 'created'
    | 'updated'
    | 'cancelled'
    | 'confirmed'
    | 'consent_requested'
    | 'consent_granted'
    | 'consent_revoked'
    | 'expired'
    | 'reposted'
    | 'interest_submitted'
  payload: Record<string, unknown>
  createdAt: string
}

export type NotificationPreference = {
  userId: string
  interest: boolean
  confirm: boolean
  cancel: boolean
}

export type NotificationEvent = {
  id: string
  recipientUserId: string
  triggerUserId: string | null
  type: 'interest' | 'confirm' | 'cancel'
  title: string
  body: string
  channel: 'email'
  status: 'queued' | 'sent' | 'failed'
  createdAt: string
}

export type AppData = {
  users: User[]
  rides: Ride[]
  threads: ChatThread[]
  messages: ChatMessage[]
  reads: MessageRead[]
  savedSearches: SavedSearch[]
  reservations: Reservation[]
  auditEvents: AuditEvent[]
  notificationPrefs: NotificationPreference[]
  notificationEvents: NotificationEvent[]
  nextAccountNumber: number
}
