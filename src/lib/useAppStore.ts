import { useEffect, useMemo, useState } from 'react'
import { featureFlags } from './flags'
import { localRepository } from './repositories/localRepository'
import { supabaseRepository } from './repositories/supabaseRepository'
import { formatPhone, phoneDigits } from './format'
import { canReserve } from './domain'
import type {
  AppData,
  AuditEvent,
  ChatMessage,
  ChatThread,
  Ride,
  SavedSearch,
  ThreadLifecycle,
  User,
} from '../types'
import { seedRides } from './seed'

const SESSION_KEY = 'uiuc-rides-session-v1'

function audit(
  prev: AppData,
  actorUserId: string | null,
  targetType: AuditEvent['targetType'],
  targetId: string,
  action: AuditEvent['action'],
  payload: Record<string, unknown> = {},
): AppData {
  return {
    ...prev,
    auditEvents: [
      ...prev.auditEvents,
      {
        id: crypto.randomUUID(),
        actorUserId,
        targetType,
        targetId,
        action,
        payload,
        createdAt: new Date().toISOString(),
      },
    ],
  }
}

function unreadCount(data: AppData, userId: string, threadId: string): number {
  const lastRead =
    data.reads.find((r) => r.threadId === threadId && r.userId === userId)?.lastReadAt ??
    '1970-01-01T00:00:00.000Z'
  return data.messages.filter((m) => m.threadId === threadId && m.createdAt > lastRead).length
}

export function useAppStore() {
  const repository = featureFlags.backendMode ? supabaseRepository : localRepository
  const [data, setData] = useState<AppData | null>(null)
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))

  useEffect(() => {
    repository.load().then(setData)
  }, [])

  useEffect(() => {
    if (!data) return
    repository.save(data)
  }, [data])

  useEffect(() => {
    if (sessionUserId) localStorage.setItem(SESSION_KEY, sessionUserId)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionUserId])

  const usersById = useMemo(() => {
    const map = new Map<string, User>()
    if (!data) return map
    for (const u of data.users) map.set(u.id, u)
    return map
  }, [data])

  const currentUser = sessionUserId ? usersById.get(sessionUserId) ?? null : null

  const helpers = {
    loginByEmail(email: string) {
      if (!data) return false
      const user = data.users.find((u) => u.schoolEmail.toLowerCase() === email.toLowerCase())
      if (!user) return false
      setSessionUserId(user.id)
      return true
    },
    signup(input: { email: string; name: string; phone: string; bio: string }) {
      if (!data) return { ok: false as const, reason: 'not-ready' }
      if (!/@illinois\.edu$/i.test(input.email.trim())) return { ok: false as const, reason: 'email' }
      if (phoneDigits(input.phone).length !== 10) return { ok: false as const, reason: 'phone' }
      if (!input.name.trim()) return { ok: false as const, reason: 'name' }
      if (data.users.some((u) => u.schoolEmail.toLowerCase() === input.email.toLowerCase())) {
        return { ok: false as const, reason: 'exists' }
      }
      const accountNumber = `A${String(data.nextAccountNumber).padStart(6, '0')}`
      const user: User = {
        id: crypto.randomUUID(),
        accountNumber,
        name: input.name.trim(),
        handle: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || 'user'}${accountNumber.slice(-3)}`,
        schoolEmail: input.email.toLowerCase(),
        phone: formatPhone(input.phone),
        bio: input.bio.trim(),
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              users: [...prev.users, user],
              notificationPrefs: [
                ...prev.notificationPrefs,
                { userId: user.id, interest: true, confirm: true, cancel: true },
              ],
              nextAccountNumber: prev.nextAccountNumber + 1,
            }
          : prev,
      )
      setSessionUserId(user.id)
      return { ok: true as const, user }
    },
    logout() {
      setSessionUserId(null)
    },
    replaceSeeds() {
      setData((prev) => (prev ? { ...prev, rides: seedRides(prev.users) } : prev))
    },
    appendSeeds() {
      setData((prev) => (prev ? { ...prev, rides: [...seedRides(prev.users), ...prev.rides] } : prev))
    },
    clearRides() {
      setData((prev) => (prev ? { ...prev, rides: [] } : prev))
    },
    saveSearch(s: Omit<SavedSearch, 'id' | 'createdAt'>) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              savedSearches: [
                ...prev.savedSearches,
                { ...s, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ],
            }
          : prev,
      )
    },
    deleteSearch(id: string) {
      setData((prev) =>
        prev ? { ...prev, savedSearches: prev.savedSearches.filter((s) => s.id !== id) } : prev,
      )
    },
    createRide(ride: Ride) {
      setData((prev) =>
        prev ? audit({ ...prev, rides: [ride, ...prev.rides] }, ride.ownerUserId, 'ride', ride.id, 'created') : prev,
      )
    },
    repostRide(rideId: string) {
      if (!data || !currentUser) return
      const existing = data.rides.find((r) => r.id === rideId && r.ownerUserId === currentUser.id)
      if (!existing) return
      const copy: Ride = {
        ...existing,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        departAt: new Date(Date.now() + 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 172800000).toISOString(),
        lifecycle: 'open',
      }
      setData((prev) =>
        prev ? audit({ ...prev, rides: [copy, ...prev.rides] }, currentUser.id, 'ride', copy.id, 'reposted') : prev,
      )
    },
    openThread(ride: Ride) {
      if (!currentUser) return null
      const members = Array.from(new Set([ride.ownerUserId, currentUser.id]))
      const existing = data?.threads.find(
        (t) =>
          t.rideId === ride.id &&
          t.memberUserIds.length === members.length &&
          t.memberUserIds.every((id) => members.includes(id)),
      )
      if (existing) return existing.id
      const thread: ChatThread = {
        id: crypto.randomUUID(),
        kind: 'direct',
        title: `${ride.departure} -> ${ride.arrival}`,
        rideId: ride.id,
        memberUserIds: members,
        createdByUserId: currentUser.id,
        createdAt: new Date().toISOString(),
        lifecycle: 'interested',
        contactConsentByUserIds: [],
        rideConfirmedByUserIds: [],
      }
      const sys: ChatMessage = {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderUserId: currentUser.id,
        text: "I'm interested in this ride.",
        createdAt: new Date().toISOString(),
        isSystem: true,
      }
      setData((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          threads: [thread, ...prev.threads],
          messages: [...prev.messages, sys],
        }
        const withAudit = audit(next, currentUser.id, 'thread', thread.id, 'created')
        return {
          ...withAudit,
          notificationEvents: [
            ...withAudit.notificationEvents,
            {
              id: crypto.randomUUID(),
              recipientUserId: ride.ownerUserId,
              triggerUserId: currentUser.id,
              type: 'interest',
              title: 'New ride interest',
              body: `${currentUser.handle} is interested in your ride.`,
              channel: 'email',
              status: 'queued',
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
      return thread.id
    },
    sendMessage(threadId: string, text: string) {
      if (!currentUser || !text.trim()) return
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        threadId,
        senderUserId: currentUser.id,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        isSystem: false,
      }
      setData((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : prev))
    },
    markRead(threadId: string) {
      if (!currentUser) return
      setData((prev) => {
        if (!prev) return prev
        const now = new Date().toISOString()
        const existing = prev.reads.find((r) => r.threadId === threadId && r.userId === currentUser.id)
        if (existing) {
          return {
            ...prev,
            reads: prev.reads.map((r) =>
              r.threadId === threadId && r.userId === currentUser.id ? { ...r, lastReadAt: now } : r,
            ),
          }
        }
        return {
          ...prev,
          reads: [...prev.reads, { id: crypto.randomUUID(), threadId, userId: currentUser.id, lastReadAt: now }],
        }
      })
    },
    setThreadLifecycle(threadId: string, lifecycle: ThreadLifecycle) {
      if (!currentUser) return
      setData((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          threads: prev.threads.map((t) => (t.id === threadId ? { ...t, lifecycle } : t)),
          messages: [
            ...prev.messages,
            {
              id: crypto.randomUUID(),
              threadId,
              senderUserId: currentUser.id,
              text: `Ride status updated to ${lifecycle}.`,
              createdAt: new Date().toISOString(),
              isSystem: true,
            },
          ],
        }
        return audit(next, currentUser.id, 'thread', threadId, lifecycle === 'cancelled' ? 'cancelled' : 'updated', {
          lifecycle,
        })
      })
    },
    requestContactConsent(threadId: string) {
      if (!currentUser) return
      setData((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          threads: prev.threads.map((t) =>
            t.id === threadId && !t.contactConsentByUserIds.includes(currentUser.id)
              ? { ...t, contactConsentByUserIds: [...t.contactConsentByUserIds, currentUser.id] }
              : t,
          ),
        }
        return audit(next, currentUser.id, 'contact_exchange', threadId, 'consent_granted')
      })
    },
    confirmReservation(rideId: string, seats: number, luggage: number) {
      if (!currentUser || !featureFlags.capacityLocking) return false
      let success = false
      setData((prev) => {
        if (!prev) return prev
        const ride = prev.rides.find((r) => r.id === rideId)
        if (!ride || ride.role !== 'driver') return prev
        if (!canReserve(ride, seats, luggage)) return prev
        success = true
        const updatedRide: Ride = {
          ...ride,
          seatsRemaining: ride.seatsRemaining - seats,
          luggageRemaining: ride.luggageRemaining - luggage,
          lifecycle: ride.seatsRemaining - seats <= 0 ? 'full' : ride.lifecycle,
        }
        const next = {
          ...prev,
          rides: prev.rides.map((r) => (r.id === rideId ? updatedRide : r)),
          reservations: [
            ...prev.reservations,
            {
              id: crypto.randomUUID(),
              rideId,
              userId: currentUser.id,
              seatsReserved: seats,
              luggageReserved: luggage,
              status: 'confirmed' as const,
              createdAt: new Date().toISOString(),
            },
          ],
        }
        return audit(next, currentUser.id, 'reservation', rideId, 'confirmed', { seats, luggage })
      })
      return success
    },
    submitInterest(
      ride: Ride,
      submission: {
        phone: string
        email: string
        sharePhone: boolean
        shareEmail: boolean
        remarks: string
        pickupLocation: string
        expectedPrice: string
        seatsRequired?: number
        luggageRequired?: number
      },
    ) {
      if (!currentUser) return
      const owner = data?.users.find((u) => u.id === ride.ownerUserId) ?? null
      if (owner?.schoolEmail) {
        const endpoint =
          (import.meta as unknown as { env?: Record<string, string | undefined> }).env
            ?.VITE_SEND_INTEREST_ENDPOINT || '/api/send-interest'
        void fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ride: {
              id: ride.id,
              role: ride.role,
              departure: ride.departure,
              arrival: ride.arrival,
              departAt: ride.departAt,
            },
            owner: {
              handle: owner.handle,
              name: owner.name,
              email: owner.schoolEmail,
            },
            from: {
              handle: currentUser.handle,
              name: currentUser.name,
              email: currentUser.schoolEmail,
              phone: currentUser.phone,
            },
            submission,
          }),
        }).catch((err) => {
          console.warn('[submitInterest] send failed (ok in local dev):', err)
        })
      }
      setData((prev) => {
        if (!prev) return prev
        const sharedContacts: string[] = []
        if (submission.sharePhone) sharedContacts.push(`phone: ${submission.phone}`)
        if (submission.shareEmail) sharedContacts.push(`email: ${submission.email}`)
        const bodyParts: string[] = [
          `${currentUser.handle} is interested in your ${ride.role === 'driver' ? 'ride offer' : 'ride request'} from ${ride.departure} to ${ride.arrival}.`,
          `Pickup: ${submission.pickupLocation}`,
          `Expected price: ${submission.expectedPrice || 'not specified'}`,
        ]
        if (submission.seatsRequired !== undefined) {
          bodyParts.push(`Seats required: ${submission.seatsRequired}`)
        }
        if (submission.luggageRequired !== undefined) {
          bodyParts.push(`Luggage required: ${submission.luggageRequired}`)
        }
        if (submission.remarks) bodyParts.push(`Remarks: ${submission.remarks}`)
        if (sharedContacts.length) bodyParts.push(`Shared contacts — ${sharedContacts.join(' · ')}`)
        const next = {
          ...prev,
          notificationEvents: [
            ...prev.notificationEvents,
            {
              id: crypto.randomUUID(),
              recipientUserId: ride.ownerUserId,
              triggerUserId: currentUser.id,
              type: 'interest' as const,
              title: `New ride interest: ${ride.departure} -> ${ride.arrival}`,
              body: bodyParts.join('\n'),
              channel: 'email' as const,
              status: 'queued' as const,
              createdAt: new Date().toISOString(),
            },
          ],
        }
        return audit(next, currentUser.id, 'ride', ride.id, 'interest_submitted', {
          sharePhone: submission.sharePhone,
          shareEmail: submission.shareEmail,
          hasRemarks: !!submission.remarks,
        })
      })
    },
    expireRides() {
      const now = Date.now()
      setData((prev) => {
        if (!prev) return prev
        let next = prev
        prev.rides.forEach((ride) => {
          if (ride.lifecycle !== 'expired' && new Date(ride.expiresAt).getTime() < now) {
            next = audit(
              {
                ...next,
                rides: next.rides.map((r) => (r.id === ride.id ? { ...r, lifecycle: 'expired' } : r)),
              },
              null,
              'ride',
              ride.id,
              'expired',
            )
          }
        })
        return next
      })
    },
  }

  const selectors = {
    unread(threadId: string) {
      if (!data || !currentUser) return 0
      return unreadCount(data, currentUser.id, threadId)
    },
  }

  return { data, setData, currentUser, usersById, sessionUserId, setSessionUserId, helpers, selectors }
}

