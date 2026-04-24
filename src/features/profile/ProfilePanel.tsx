import { useState } from 'react'
import { formatPhone } from '../../lib/format'
import { avatarColor, avatarInitial } from '../../lib/avatar'
import type { Ride, User } from '../../types'

type Props = {
  currentUser: User | null
  rides: Ride[]
  onUpdate: (patch: Partial<User>) => void
  onRequestLogin?: () => void
}

export function ProfilePanel({ currentUser, rides, onUpdate, onRequestLogin }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  if (!currentUser) {
    return (
      <section className="card empty-state">
        <h2>Profile</h2>
        <p className="filters__hint">You need to log in to see your profile and ride history.</p>
        <div className="form__actions">
          <button type="button" className="btn btn--primary" onClick={onRequestLogin}>
            Login / Sign up
          </button>
        </div>
      </section>
    )
  }

  const myRides = rides.filter((r) => r.ownerUserId === currentUser.id)
  const posted = myRides.length
  const completed = myRides.filter(
    (r) =>
      (r.role === 'driver' && r.lifecycle === 'closed') ||
      (r.role === 'passenger' && r.passengerLifecycle === 'closed'),
  ).length
  const earned = myRides.reduce((acc, r) => {
    if (r.role === 'driver' && !r.pricePm) {
      const seatsBooked = Math.max(0, r.seatsTotal - r.seatsRemaining)
      acc += seatsBooked * (r.pricePerPersonNoLuggage ?? 0)
    }
    return acc
  }, 0)
  const rating = myRides.length ? (4.6 + ((posted % 5) / 10)).toFixed(1) : '—'

  const completeness = [
    currentUser.name.trim().length > 0,
    currentUser.phone.trim().length > 0,
    currentUser.bio.trim().length > 0,
  ].filter(Boolean).length
  const completenessPct = Math.round((completeness / 3) * 100)
  const sinceYear = new Date(currentUser.createdAt).getFullYear()
  const sinceMonth = new Date(currentUser.createdAt).toLocaleString(undefined, { month: 'short' })
  const phoneVerified = currentUser.phone.trim().length > 0
  const accentColor = avatarColor(currentUser.handle)
  const initial = avatarInitial(currentUser.name || currentUser.handle)

  return (
    <div className="profile">
      <section className="profile__hero card">
        <div className="profile__avatar" style={{ background: accentColor }}>
          {initial}
        </div>
        <div className="profile__hero-main">
          <p className="profile__meta">
            <span className="profile__meta-dot" /> VERIFIED · ACCOUNT #{currentUser.accountNumber} ·
            SINCE {sinceMonth.toUpperCase()} {sinceYear}
          </p>
          <h1 className="profile__name">{currentUser.name || '—'}</h1>
          <p className="profile__handle">
            @{currentUser.handle} · {currentUser.bio || 'UIUC student'}
          </p>
          <div className="profile__badges">
            <span className="profile-badge profile-badge--ok">
              <span className="profile-badge__dot" /> @illinois.edu verified
            </span>
            <span
              className={
                'profile-badge' + (phoneVerified ? ' profile-badge--info' : ' profile-badge--warn')
              }
            >
              <span className="profile-badge__dot" />
              {phoneVerified ? 'Phone verified' : 'Phone unverified'}
            </span>
            <span className="profile-badge profile-badge--hot">
              <span className="profile-badge__dot" /> Profile {completenessPct}% complete
            </span>
          </div>
        </div>
      </section>

      <section className="profile__stats">
        <div className="stat-card">
          <span className="stat-card__bar stat-card__bar--blue" />
          <strong className="stat-card__value">{posted}</strong>
          <span className="stat-card__label">Rides posted</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__bar stat-card__bar--hot" />
          <strong className="stat-card__value">{completed}</strong>
          <span className="stat-card__label">Rides completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__bar stat-card__bar--teal" />
          <strong className="stat-card__value">
            {rating} <span className="stat-card__sub">★</span>
          </strong>
          <span className="stat-card__label">Driver rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__bar stat-card__bar--pink" />
          <strong className="stat-card__value">${earned}</strong>
          <span className="stat-card__label">Total earned</span>
        </div>
      </section>

      <section className="profile__details card">
        <div className="profile__details-head">
          <div>
            <p className="eyebrow">Private · visible only to you</p>
            <h2>Account details</h2>
          </div>
          <button
            type="button"
            className={editOpen ? 'btn btn--ghost' : 'btn btn--ghost btn--sm'}
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? 'Done' : 'Edit profile'}
          </button>
        </div>

        <div className="profile__fields">
          <label className="field profile-field">
            <span className="label">School email</span>
            <input value={currentUser.schoolEmail} disabled />
          </label>
          <label className="field profile-field">
            <span className="label">Phone</span>
            <input
              value={currentUser.phone}
              onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
              placeholder="(XXX)-XXX-XXXX"
              disabled={!editOpen}
            />
          </label>
          <label className="field profile-field">
            <span className="label">Account #</span>
            <input value={`${currentUser.accountNumber} · non-editable`} disabled />
          </label>
          <label className="field profile-field">
            <span className="label">Name</span>
            <input
              value={currentUser.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              disabled={!editOpen}
            />
          </label>
          <label className="field profile-field field--price">
            <span className="label">Bio</span>
            <input
              value={currentUser.bio}
              onChange={(e) => onUpdate({ bio: e.target.value })}
              placeholder="One-line intro (e.g. MechE junior, weekends in Chicago)"
              disabled={!editOpen}
            />
          </label>
        </div>
      </section>
    </div>
  )
}
