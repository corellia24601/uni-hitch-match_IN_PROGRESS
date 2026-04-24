import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Ride, User } from '../../types'
import { formatCurrency, formatDepartDisplay } from './helpers'
import { avatarColor, avatarInitial } from '../../lib/avatar'
import { formatPhone, phoneDigits } from '../../lib/format'
import { useViewport } from '../../lib/useViewport'

export type InterestSubmission = {
  phone: string
  email: string
  sharePhone: boolean
  shareEmail: boolean
  remarks: string
  pickupLocation: string
  expectedPrice: string
  seatsRequired?: number
  luggageRequired?: number
}

type Props = {
  ride: Ride
  currentUser: User | null
  owner: User | null
  onClose: () => void
  onRequestAuth: (mode: 'login' | 'signup') => void
  onSubmit: (submission: InterestSubmission) => void
}

export function InterestModal({
  ride,
  currentUser,
  owner,
  onClose,
  onRequestAuth,
  onSubmit,
}: Props) {
  const { isMobile } = useViewport()
  const userIsPassenger = ride.role === 'driver'
  const isLocked = !currentUser
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [email, setEmail] = useState(currentUser?.schoolEmail ?? '')

  useEffect(() => {
    if (currentUser) {
      setPhone((prev) => (prev ? prev : currentUser.phone))
      setEmail((prev) => (prev ? prev : currentUser.schoolEmail))
    }
  }, [currentUser])

  const [sharePhone, setSharePhone] = useState(true)
  const [shareEmail, setShareEmail] = useState(true)
  const [remarks, setRemarks] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [expectedPrice, setExpectedPrice] = useState('')
  const [seatsRequired, setSeatsRequired] = useState('1')
  const [luggageRequired, setLuggageRequired] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const ridePrice = useMemo(() => {
    if (ride.role === 'driver') return formatCurrency(ride.pricePerPersonNoLuggage)
    return formatCurrency(ride.passengerLuggagePrice)
  }, [ride])

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!currentUser) {
      setError('Please sign in first — it only takes 10s.')
      return
    }
    if (!phone.trim() && !email.trim()) {
      setError('Please provide at least a phone or an email.')
      return
    }
    if (phone && phoneDigits(phone).length !== 10) {
      setError('Phone must be a valid 10-digit number.')
      return
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!sharePhone && !shareEmail) {
      setError('Pick at least one contact to share so the ride owner can reach you.')
      return
    }
    if (sharePhone && phoneDigits(phone).length !== 10) {
      setError('You chose to share your phone — please make sure it is a valid 10-digit number.')
      return
    }
    if (shareEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('You chose to share your email — please make sure it is valid.')
      return
    }
    if (!pickupLocation.trim()) {
      setError('Please enter a pickup location.')
      return
    }
    const payload: InterestSubmission = {
      phone,
      email,
      sharePhone,
      shareEmail,
      remarks: remarks.trim(),
      pickupLocation: pickupLocation.trim(),
      expectedPrice: expectedPrice.trim(),
    }
    if (userIsPassenger) {
      const seatsN = Number(seatsRequired)
      const lugN = Number(luggageRequired)
      if (!Number.isInteger(seatsN) || seatsN < 1) {
        setError('Seats required must be a whole number, at least 1.')
        return
      }
      if (!Number.isInteger(lugN) || lugN < 0) {
        setError('Luggage required must be a whole number (0 or more).')
        return
      }
      payload.seatsRequired = seatsN
      payload.luggageRequired = lugN
    }
    onSubmit(payload)
    setSubmitted(true)
  }

  return (
    <div
      className={'modal-overlay' + (isMobile ? ' modal-overlay--sheet' : '')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={'modal-box interest-modal' + (isMobile ? ' interest-modal--sheet' : '')}>
        <div className="interest-modal__head">
          <h2>Send your details to @{owner?.handle ?? 'the poster'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="interest-modal__sub">
          We&rsquo;ll forward this form straight to @{owner?.handle ?? 'the poster'}&rsquo;s email.
          They&rsquo;ll reach out via the contacts you choose to share.
        </p>

        {submitted ? (
          <div className="interest-modal__success">
            <div className="interest-modal__check" aria-hidden>✓</div>
            <h3>Request sent!</h3>
            <p>
              We&rsquo;ve forwarded your form to @{owner?.handle ?? 'the poster'}. Keep an eye on your{' '}
              {sharePhone && shareEmail ? 'phone and email' : sharePhone ? 'phone' : 'email'} — they may
              reach out soon.
            </p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <section className="interest-ride-card">
              <div className="interest-ride-card__top">
                <span className="pill">
                  {ride.departure} {'->'} {ride.arrival}
                </span>
                <time>{formatDepartDisplay(ride.departAt)}</time>
              </div>
              <dl className="interest-ride-card__meta">
                {ride.role === 'driver' ? (
                  <>
                    <div>
                      <dt>Seats left</dt>
                      <dd>{ride.seatsRemaining}</dd>
                    </div>
                    <div>
                      <dt>Luggage left</dt>
                      <dd>{ride.luggageRemaining}</dd>
                    </div>
                    <div>
                      <dt>Price per person starts from</dt>
                      <dd>{ridePrice}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt>Seats needed</dt>
                      <dd>{ride.seatsNeeded}</dd>
                    </div>
                    <div>
                      <dt>Luggage needed</dt>
                      <dd>{ride.luggageNeeded}</dd>
                    </div>
                    <div>
                      <dt>Price (Passenger + Luggage)</dt>
                      <dd>{ridePrice}</dd>
                    </div>
                  </>
                )}
              </dl>
              <div className="interest-ride-card__owner">
                <span
                  className="interest-ride-card__avatar"
                  style={{ background: avatarColor(owner?.handle ?? owner?.id) }}
                >
                  {avatarInitial(owner?.name || owner?.handle)}
                </span>
                <div>
                  <p className="interest-ride-card__owner-label">
                    {ride.role === 'driver' ? 'Driver' : 'Passenger'}
                  </p>
                  <p className="interest-ride-card__owner-handle">
                    @{owner?.handle ?? 'unknown'}
                  </p>
                </div>
              </div>
            </section>

            <form className="interest-form" onSubmit={submit}>
              <section
                className={
                  'interest-form__section interest-auth-step' +
                  (isLocked ? ' interest-auth-step--locked' : ' interest-auth-step--done')
                }
                aria-live="polite"
              >
                <div className="interest-auth-step__head">
                  <span
                    className={
                      'interest-auth-step__num' +
                      (isLocked ? '' : ' interest-auth-step__num--done')
                    }
                    aria-hidden
                  >
                    {isLocked ? '1' : '✓'}
                  </span>
                  <div>
                    <p className="interest-auth-step__title">
                      {isLocked ? 'Sign in to continue' : 'Signed in'}
                    </p>
                    <p className="interest-auth-step__sub">
                      {isLocked
                        ? "Browse the whole form below first — you'll need to sign in before you can fill it out or submit."
                        : `You're signed in as @${currentUser?.handle ?? ''}. Form unlocked below.`}
                    </p>
                  </div>
                </div>
                {isLocked && (
                  <div className="interest-auth-step__actions">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => onRequestAuth('login')}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => onRequestAuth('signup')}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </section>

              {userIsPassenger && (
                <fieldset className="interest-form__section" disabled={isLocked}>
                  <legend>Seats &amp; luggage you need</legend>
                  <p className="interest-form__hint">
                    You&rsquo;re joining as a <strong>passenger</strong>. Tell the driver how much space
                    you need.
                  </p>
                  <div className="interest-form__row">
                    <label className="field">
                      <span className="label">Seats required</span>
                      <input
                        value={seatsRequired}
                        onChange={(e) => setSeatsRequired(e.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                    <label className="field">
                      <span className="label">Luggage required</span>
                      <input
                        value={luggageRequired}
                        onChange={(e) => setLuggageRequired(e.target.value)}
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                </fieldset>
              )}

              <fieldset className="interest-form__section" disabled={isLocked}>
                <legend>Your expected price</legend>
                <p className="interest-form__hint">
                  {userIsPassenger
                    ? "Let the driver know what you'd pay."
                    : "Let the passenger know what you'd charge."}
                </p>
                <label className="field">
                  <span className="visually-hidden">Your expected price</span>
                  <input
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    placeholder={userIsPassenger ? '$25 or flexible' : '$28 or negotiable'}
                  />
                </label>
              </fieldset>

              <fieldset className="interest-form__section" disabled={isLocked}>
                <legend>Pickup location</legend>
                <label className="field">
                  <span className="label">
                    Pickup location{' '}
                    <span className="label-hint">
                      (e.g. &ldquo;1401 W Green St&rdquo; — please include a building number &amp; street name)
                    </span>
                  </span>
                  <input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="1401 W Green St, Urbana"
                  />
                </label>
              </fieldset>

              <fieldset className="interest-form__section" disabled={isLocked}>
                <legend>Remarks</legend>
                <p className="interest-form__hint">
                  Anything you&rsquo;d like to tell the {ride.role === 'driver' ? 'driver' : 'passenger'}.
                </p>
                <label className="field">
                  <span className="visually-hidden">Remarks</span>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder="e.g. Flexible on pickup by ±10 min. One medium suitcase."
                  />
                </label>
              </fieldset>

              <fieldset className="interest-form__section" disabled={isLocked}>
                <legend>Your contact</legend>
                <p className="interest-form__hint">
                  {isLocked ? (
                    <>Sign in and we&rsquo;ll prefill your phone &amp; email from your profile.</>
                  ) : (
                    <>
                      We prefilled these from your profile. <strong>Double-check they&rsquo;re currently
                      reachable</strong> — the ride owner will use them to reach out.
                    </>
                  )}
                </p>
                <div className="interest-form__row">
                  <label className="field">
                    <span className="label">Phone</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(XXX)-XXX-XXXX"
                      inputMode="tel"
                    />
                  </label>
                  <label className="field">
                    <span className="label">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@illinois.edu"
                      inputMode="email"
                    />
                  </label>
                </div>
                <div className="interest-form__shares interest-form__row">
                  <label className="check check--inline">
                    <input
                      type="checkbox"
                      checked={sharePhone}
                      onChange={(e) => setSharePhone(e.target.checked)}
                    />
                    Share with @{owner?.handle ?? 'the poster'}
                  </label>
                  <label className="check check--inline">
                    <input
                      type="checkbox"
                      checked={shareEmail}
                      onChange={(e) => setShareEmail(e.target.checked)}
                    />
                    Share with @{owner?.handle ?? 'the poster'}
                  </label>
                </div>
                <p
                  className={
                    'interest-form__consent' +
                    (!sharePhone && !shareEmail ? ' interest-form__consent--warn' : '')
                  }
                >
                  You must share at least one contact so @{owner?.handle ?? 'the poster'} can reach you.
                </p>
              </fieldset>

              <section className="interest-flow">
                <h3 className="interest-flow__title">What happens next</h3>
                <ol className="interest-flow__steps">
                  <li className="interest-flow__step">
                    <span className="interest-flow__num">1</span>
                    <div>
                      <p className="interest-flow__head">
                        System forwards this form to @{owner?.handle ?? 'the poster'}&rsquo;s email
                      </p>
                      <p className="interest-flow__body">
                        Only the contacts you checked above are shared. Your other info stays private.
                      </p>
                    </div>
                  </li>
                  <li className="interest-flow__arrow" aria-hidden>
                    ↓
                  </li>
                  <li className="interest-flow__step">
                    <span className="interest-flow__num">2</span>
                    <div>
                      <p className="interest-flow__head">They reach out, or decline</p>
                      <p className="interest-flow__body">
                        If it&rsquo;s a fit, they text or email you directly. You&rsquo;ll also get
                        notified via email if they declined.
                      </p>
                    </div>
                  </li>
                </ol>
              </section>

              {error && <p className="form-error">{error}</p>}

              <div className="interest-form__actions">
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Cancel
                </button>
                {isLocked ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => onRequestAuth('login')}
                  >
                    Sign in to submit
                  </button>
                ) : (
                  <button type="submit" className="btn btn--primary">
                    Send my interest
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
