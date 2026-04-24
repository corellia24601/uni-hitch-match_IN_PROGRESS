import type { Ride } from '../../types'

type Props = {
  rides: Ride[]
}

export function HeroIntro({ rides }: Props) {
  const liveCount = rides.filter((r) => r.lifecycle === 'open').length

  return (
    <section className="hero">
      <p className="hero__eyebrow">• A non-profit bulletin board by students &amp; for students</p>
      <h1 className="hero__headline">
        Cheap, flexible, private rides with <span className="hero__accent">UIUC students</span> like you.
      </h1>
      <div className="hero__body">
        <div className="hero__copy">
          <p className="hero__sub">
            Verified @illinois.edu students only. Split gas to{' '}
            <span className="hero__route">ORD, MDW, or Downtown Chicago</span>, offer or grab a
            seat in 10s.
          </p>
          <p className="hero__sub hero__sub--pledge">
            We just connect verified Illini going the same way — you set the price, you make the
            plan, you ride on your own terms.
          </p>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>{liveCount}+</strong>
            <span>live rides</span>
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
