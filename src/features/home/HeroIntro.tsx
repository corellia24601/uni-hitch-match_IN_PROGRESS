import type { Ride } from '../../types'

type Props = {
  rides: Ride[]
}

export function HeroIntro({ rides }: Props) {
  const liveCount = rides.filter((r) => r.lifecycle === 'open').length
  const driverPrices = rides
    .filter((r) => r.role === 'driver' && !r.pricePm && r.pricePerPersonNoLuggage)
    .map((r) => (r.role === 'driver' ? r.pricePerPersonNoLuggage ?? 0 : 0))
  const avgFare = driverPrices.length
    ? Math.round(driverPrices.reduce((a, b) => a + b, 0) / driverPrices.length)
    : 28

  return (
    <section className="hero">
      <p className="hero__eyebrow">• Built by &amp; for UIUC students</p>
      <h1 className="hero__headline">
        Cheap, flexible, private rides with <span className="hero__accent">UIUC students</span> like you.
      </h1>
      <div className="hero__body">
        <p className="hero__sub">
          Verified @illinois.edu students only. Split gas to{' '}
          <span className="hero__accent">ORD, MDW, or Downtown Chicago</span> — no apps for strangers,
          no Megabus. Post a seat or grab one in ~10 seconds.
        </p>
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>{liveCount}+</strong>
            <span>live rides</span>
          </div>
          <div className="hero__stat">
            <strong className="hero__stat-accent">${avgFare}</strong>
            <span>avg fare</span>
          </div>
          <div className="hero__stat">
            <strong>100%</strong>
            <span>verified students</span>
          </div>
        </div>
      </div>
    </section>
  )
}
