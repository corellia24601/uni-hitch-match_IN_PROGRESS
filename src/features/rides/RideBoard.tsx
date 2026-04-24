import { useMemo, useState } from 'react'
import { filterAndSortRides, type RideFilters } from '../../filterRides'
import { formatCurrency, formatDepartDisplay } from './helpers'
import type { Location, Ride, RidePool, User } from '../../types'
import { LOCATIONS } from '../../types'

type Props = {
  rides: Ride[]
  currentUser: User | null
  usersById: Map<string, User>
  onCreateRide: (ride: Ride) => void
  onInterested: (ride: Ride) => void
  onRepost: (rideId: string) => void
}

const emptyFilters: RideFilters = {
  dateFrom: '',
  dateTo: '',
  departure: '',
  arrival: '',
  seatThreshold: '',
  luggageThreshold: '',
  sortDir: 'asc',
}

export function RideBoard({
  rides,
  currentUser,
  usersById,
  onCreateRide,
  onInterested,
  onRepost,
}: Props) {
  const [pool, setPool] = useState<RidePool>('driver')
  const [filters, setFilters] = useState<RideFilters>(emptyFilters)
  const [postOpen, setPostOpen] = useState(false)
  const [postRole, setPostRole] = useState<RidePool>('driver')
  const [departAtLocal, setDepartAtLocal] = useState('')
  const [departure, setDeparture] = useState<Location>('UIUC')
  const [arrival, setArrival] = useState<Location>('Chicago Downtown')
  const [pickupDetail, setPickupDetail] = useState('')
  const [dropoffDetail, setDropoffDetail] = useState('')
  const [notes, setNotes] = useState('')
  const [seats, setSeats] = useState('1')
  const [luggage, setLuggage] = useState('0')
  const [flexibleMinutes, setFlexibleMinutes] = useState('15')
  const [allowPets, setAllowPets] = useState(false)
  const [allowSmoking, setAllowSmoking] = useState(false)
  const [musicPreference, setMusicPreference] = useState<'quiet' | 'light' | 'any'>('light')
  const [cancellationPolicy, setCancellationPolicy] = useState<'flexible' | '2h_notice' | 'strict'>('flexible')
  const [pricePm, setPricePm] = useState(false)
  const [driverBasePrice, setDriverBasePrice] = useState('')
  const [driverLuggagePrice, setDriverLuggagePrice] = useState('')
  const [passengerPrice, setPassengerPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(
    () => filterAndSortRides(rides, pool, filters),
    [rides, pool, filters],
  )

  const relatedRides = useMemo(() => {
    if (!filters.departure || !filters.arrival) return []
    return rides
      .filter(
        (r) => r.departure === filters.departure && r.arrival === filters.arrival,
      )
      .slice(0, 3)
  }, [filters.departure, filters.arrival, rides])

  function createPost(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!currentUser) return setError('Login required.')
    const seatsN = Number(seats)
    const luggageN = Number(luggage)
    const flex = Number(flexibleMinutes)
    if (!departAtLocal || Number.isNaN(new Date(departAtLocal).getTime())) return setError('Valid date/time required.')
    if (!Number.isInteger(seatsN) || seatsN < 0) return setError('Seats must be a whole number.')
    if (!Number.isInteger(luggageN) || luggageN < 0) return setError('Luggage must be a whole number.')
    const common = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      departAt: new Date(departAtLocal).toISOString(),
      ownerUserId: currentUser.id,
      departure,
      arrival,
      pickupDetail,
      dropoffDetail,
      notes,
      flexibleMinutes: Number.isFinite(flex) ? flex : 0,
      allowPets,
      allowSmoking,
      musicPreference,
      cancellationPolicy,
      expiresAt: new Date(new Date(departAtLocal).getTime() + 24 * 3600 * 1000).toISOString(),
      lifecycle: 'open' as const,
    }
    const ride: Ride =
      postRole === 'driver'
        ? {
            ...common,
            role: 'driver',
            seatsTotal: seatsN,
            seatsRemaining: seatsN,
            luggageTotal: luggageN,
            luggageRemaining: luggageN,
            pricePerPersonNoLuggage: pricePm ? null : Number(driverBasePrice || 0),
            pricePerLuggage: pricePm ? null : Number(driverLuggagePrice || 0),
            pricePm,
          }
        : {
            ...common,
            role: 'passenger',
            passengerLifecycle: 'searching',
            seatsNeeded: seatsN,
            luggageNeeded: luggageN,
            passengerLuggagePrice: pricePm ? null : Number(passengerPrice || 0),
            pricePm,
          }
    onCreateRide(ride)
    setPostOpen(false)
  }

  function clearFilters() {
    setFilters(emptyFilters)
  }

  return (
    <section className="rideboard">
      <div className="rideboard__head">
        <div>
          <h2 className="rideboard__title">Ride board</h2>
          <p className="rideboard__subtitle">Live posts between campus &amp; Chicago</p>
        </div>
        <button type="button" className="btn btn--hot" onClick={() => setPostOpen((v) => !v)}>
          {postOpen ? 'Close form' : '+ Post a ride'}
        </button>
      </div>

      {postOpen && (
        <section className="card post-card">
          <h2>New ride post</h2>
          <form className="form" onSubmit={createPost}>
            <div className="form__grid">
              <label className="field">
                <span className="label">Role</span>
                <select value={postRole} onChange={(e) => setPostRole(e.target.value as RidePool)}>
                  <option value="driver">Driver</option>
                  <option value="passenger">Passenger</option>
                </select>
              </label>
              <label className="field">
                <span className="label">Date & start time</span>
                <input type="datetime-local" value={departAtLocal} onChange={(e) => setDepartAtLocal(e.target.value)} />
              </label>
              <label className="field">
                <span className="label">Departure</span>
                <select value={departure} onChange={(e) => setDeparture(e.target.value as Location)}>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="label">Arrival</span>
                <select value={arrival} onChange={(e) => setArrival(e.target.value as Location)}>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="field"><span className="label">Seats</span><input value={seats} onChange={(e) => setSeats(e.target.value)} /></label>
              <label className="field"><span className="label">Luggage</span><input value={luggage} onChange={(e) => setLuggage(e.target.value)} /></label>
              <label className="field"><span className="label">Pickup detail</span><input value={pickupDetail} onChange={(e) => setPickupDetail(e.target.value)} /></label>
              <label className="field"><span className="label">Dropoff detail</span><input value={dropoffDetail} onChange={(e) => setDropoffDetail(e.target.value)} /></label>
              <label className="field"><span className="label">Notes</span><input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
              <label className="field"><span className="label">Flexible +/- minutes</span><input value={flexibleMinutes} onChange={(e) => setFlexibleMinutes(e.target.value)} /></label>
              <label className="field"><span className="label">Music</span><select value={musicPreference} onChange={(e) => setMusicPreference(e.target.value as 'quiet' | 'light' | 'any')}><option value="quiet">Quiet</option><option value="light">Light</option><option value="any">Any</option></select></label>
              <label className="field"><span className="label">Cancellation policy</span><select value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value as 'flexible' | '2h_notice' | 'strict')}><option value="flexible">Flexible</option><option value="2h_notice">2-hour notice</option><option value="strict">Strict</option></select></label>
              <label className="check"><input type="checkbox" checked={allowPets} onChange={(e) => setAllowPets(e.target.checked)} />Allow pets</label>
              <label className="check"><input type="checkbox" checked={allowSmoking} onChange={(e) => setAllowSmoking(e.target.checked)} />Allow smoking</label>
              <label className="check"><input type="checkbox" checked={pricePm} onChange={(e) => setPricePm(e.target.checked)} />PM to discuss</label>
              {!pricePm && postRole === 'driver' && (
                <>
                  <label className="field"><span className="label">Price per person starts from</span><input value={driverBasePrice} onChange={(e) => setDriverBasePrice(e.target.value)} /></label>
                  <label className="field"><span className="label">Price per luggage</span><input value={driverLuggagePrice} onChange={(e) => setDriverLuggagePrice(e.target.value)} /></label>
                </>
              )}
              {!pricePm && postRole === 'passenger' && (
                <label className="field"><span className="label">Price (Passenger + Luggage)</span><input value={passengerPrice} onChange={(e) => setPassengerPrice(e.target.value)} /></label>
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form__actions"><button className="btn btn--primary">Publish</button></div>
          </form>
        </section>
      )}

      <div className="pool-tabs">
        <button type="button" className={pool === 'driver' ? 'tab tab--active' : 'tab'} onClick={() => setPool('driver')}>Rides Offering</button>
        <button type="button" className={pool === 'passenger' ? 'tab tab--active' : 'tab'} onClick={() => setPool('passenger')}>Rides Seeking</button>
      </div>

      <div className="card filters">
        <h2>Search & filter</h2>
        <div className="filters__grid">
          <div className="filters__row">
            <div className="filters__pair">
              <label className="field"><span className="label">From date</span><input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} /></label>
              <label className="field"><span className="label">To date</span><input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} /></label>
            </div>
            <div className="filters__pair">
              <label className="field"><span className="label">Departure</span><select value={filters.departure} onChange={(e) => setFilters((f) => ({ ...f, departure: e.target.value as Location | '' }))}><option value="">Any</option>{LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
              <label className="field"><span className="label">Arrival</span><select value={filters.arrival} onChange={(e) => setFilters((f) => ({ ...f, arrival: e.target.value as Location | '' }))}><option value="">Any</option>{LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
            </div>
          </div>
          <div className="filters__row">
            <div className="filters__pair">
              <label className="field"><span className="label">{pool === 'passenger' ? 'Max. Seats Needed' : 'Min. Seats Remaining'}</span><input value={filters.seatThreshold} onChange={(e) => setFilters((f) => ({ ...f, seatThreshold: e.target.value }))} /></label>
              <label className="field"><span className="label">{pool === 'passenger' ? 'Max. Luggage Needed' : 'Min. Luggage Remaining'}</span><input value={filters.luggageThreshold} onChange={(e) => setFilters((f) => ({ ...f, luggageThreshold: e.target.value }))} /></label>
            </div>
            <div className="filters__pair filters__pair--sort">
              <label className="field"><span className="label">Sort</span><select value={filters.sortDir} onChange={(e) => setFilters((f) => ({ ...f, sortDir: e.target.value as 'asc' | 'desc' }))}><option value="asc">Soonest</option><option value="desc">Latest</option></select></label>
              <div className="filters__actions">
                <button type="button" className="btn btn--primary">Search</button>
                <button type="button" className="btn btn--ghost" onClick={clearFilters}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedRides.length > 0 && (
        <div className="card">
          <h2>Related rides</h2>
          <ul className="ride-list">
            {relatedRides.map((r) => (
              <li key={r.id} className="ride-card">
                <p>{r.departure} {'->'} {r.arrival} at {formatDepartDisplay(r.departAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="ride-list">
        {visible.map((r) => {
          const owner = usersById.get(r.ownerUserId)
          return (
            <li key={r.id} className="ride-card">
              <div className="ride-card__top">
                <span className="pill">{r.departure} {'->'} {r.arrival}</span>
                <time>{formatDepartDisplay(r.departAt)}</time>
              </div>
              <dl className="ride-card__meta">
                {r.role === 'driver' ? (
                  <>
                    <div><dt>Seats left</dt><dd>{r.seatsRemaining}</dd></div>
                    <div><dt>Luggage left</dt><dd>{r.luggageRemaining}</dd></div>
                    <div><dt>Price per person starts from</dt><dd>{formatCurrency(r.pricePerPersonNoLuggage)}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>Seats needed</dt><dd>{r.seatsNeeded}</dd></div>
                    <div><dt>Luggage needed</dt><dd>{r.luggageNeeded}</dd></div>
                    <div><dt>Price (Passenger + Luggage)</dt><dd>{formatCurrency(r.passengerLuggagePrice)}</dd></div>
                  </>
                )}
              </dl>
              <div className="ride-card__contact">
                <span className="ride-card__contact-label">
                  {r.role === 'driver' ? 'Driver' : 'Passenger'}: @{owner?.handle ?? 'unknown'}
                </span>
                <div className="ride-card__contact-actions">
                  {currentUser?.id !== r.ownerUserId && (
                    <button type="button" className="btn btn--hot btn--sm" onClick={() => onInterested(r)}>
                      I'm interested →
                    </button>
                  )}
                  {currentUser?.id === r.ownerUserId && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => onRepost(r.id)}>
                      Repost
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

