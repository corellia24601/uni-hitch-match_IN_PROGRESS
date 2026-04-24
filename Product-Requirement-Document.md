# Product Requirement Document

## PRD: UIUC Long-Distance Ridesharing Platform

**Working name:** Uni Hitch Match ([uni-hitch-match.win](https://uni-hitch-match.win))
**Author:** _you_
**Status:** Draft v0.1
**Last updated:** April 2026

---

## 1. Executive Summary

A closed-community ridesharing marketplace that matches UIUC-affiliated drivers and riders for long-distance trips, initially restricted to the Champaign–Urbana ↔ Chicago corridor (downtown Chicago, O'Hare, and Midway). The product's wedge is trust (verified `.illinois.edu` identity) plus focus (long-distance only, one corridor), in contrast to Facebook groups, scattered Reddit posts, and general-purpose rideshare apps.

**Core hypothesis to validate:** UIUC students will prefer a more flexible, dedicated, verified-only rideshare platform over existing alternatives (Peoria Charter, Amtrak, Facebook groups) when the product reliably produces matches around break periods.

**Why this can work:** UIUC has ~56,000 students, a significant fraction of whom travel to Chicagoland frequently. Current demand is partially served by buses ($35-45/one way, fixed schedules, low frequency), Amtrak (~$20~30/one way, downtown only and no ORD/MDW, fixed schedules, low frequency) and fragmented informal channels (Facebook groups, /r/UIUC, WeChat). There is no trusted, purpose-built platform with identity verification for more flexibility and comfort in this specific lane.

**Why this can fail:** Two-sided marketplaces have cold-start problems. Supply (drivers) is the harder side. Legal/insurance exposure is real. Incumbents (buses) have strong habit-formed customers. A general-purpose competitor (or the university itself) could launch something similar.

---

## 2. Problem & Opportunity

### 2.1 Problem

UIUC students who travel between Champaign–Urbana and the Chicago area face three unattractive options:

1. **Buses & Trains (Peoria Charter, Greyhound, Flixbus, Amtrak):** Fixed schedules, often sold out before breaks, $35–45 one way, bus-stop-to-bus-stop only, requires onward transit to final destination. Often couldn't fit class schedules and flight times.
2. **Driving one's own car:** Full gas/tolls cost (~$35–50 one way), wear on vehicle, parking costs in Chicago, and many underclassmen don't have cars on campus.
3. **Informal carpooling on Facebook/GroupMe/Reddit:** flexible schedule and door-to-door, but hard to discover, no verification, no structured safety, fragmented across groups, information decays in chat backlogs.

### 2.2 Opportunity

Package the economics and flexibility of informal carpooling with the discoverability and trust of a structured marketplace, restricted to UIUC affiliates to solve the "am I getting in a car with a stranger?" problem by proxy.

### 2.3 Market sizing (rough)

- UIUC enrollment: ~56,000 students
- Estimated % who travel to Chicagoland monthly during term: 20–30%
- Peak travel windows (4–5x/year): Thanksgiving, Winter break start/return, Spring break start/return, end-of-semester move-out
- Estimated addressable trips per peak weekend: 5,000–10,000 one-way seats
- Reasonable 3-year capture goal: 5–15% of this demand

---

## 3. Target Users & Personas

### 3.1 Rider persona: "Priya, sophomore from Naperville"
- No car on campus. Flies home ~3 times/year via ORD and visits family ~monthly.
- Primary pain: buses are sold out Wednesday before Thanksgiving; Ubers to ORD cost $200+.
- Wants: predictable price ~$25, door-to-door, departure window that fits her class schedule.

### 3.2 Driver persona: "Marcus, junior from Hyde Park"
- Has a car on campus, drives home roughly biweekly.
- Primary pain: gas/tolls round-trip are ~$60; likes company on the drive; trusts UIUC students over Craigslist randoms.
- Wants: 2–3 riders splitting costs, easy scheduling, minimal coordination effort, people who won't cancel last minute.

### 3.3 Secondary personas (defer)
- Grad students, staff, faculty, alumni — out of scope for MVP.

---

## 4. Competitive Landscape

| Competitor | Price (one-way) | Schedule | Door-to-door | Trust/Verification | Weakness |
|---|---|---|---|---|---|
| Peoria Charter | $35–45 | Fixed, limited | No | Operator-vetted | Rigid, sells out at peaks |
| Amtrak | $28–40 | 2x/day, slow (~2.5–3h) | No | N/A | Limited times, Union Station only |
| Greyhound/FlixBus | $30–50 | Limited | No | N/A | Declining service |
| Uber/Lyft | $200+ | On-demand | Yes | Platform-verified | Prohibitively expensive |
| Facebook groups, /r/UIUC, GroupMe | ? | Flexible | Yes | None | Fragmented, no verification, chat-only |
| **This product** | **$20–50 (target)** | **Flexible** | **Yes** | **`.illinois.edu` verified** | **Cold-start risk** |

The product isn't trying to beat buses on reliability; it's trying to iterate the Facebook groups and Reddit posts on discoverability, information integration and trust, to build a bridge from students to students.

---

## 5. Goals & Success Metrics

### 5.1 North-star metric
**Completed matched rides per peak week** (a match where both driver and ≥1 rider confirm the ride took place).

### 5.2 MVP success criteria (pick a concrete target before launch)
- **Launch window:** 2–3 weeks before a major break (Thanksgiving or Spring break recommended).
- **Top-of-funnel:** 500 verified user signups in first 2 weeks.
- **Liquidity proxy:** 50+ ride postings within MVP window.
- **Core hypothesis validation:** 20+ completed, confirmed rides with ≥1 paired rider in the first peak weekend.
- **Retention proxy:** ≥30% of matched users post or request again within 8 weeks.

### 5.3 Guardrail metrics
- Zero reported safety incidents in MVP period.
- <5% of rides end in a no-show by either party.
- Support load: <1 support ticket per 20 completed rides.

---

## 6. Key User Journeys

### 6.1 Driver posts a ride
1. Land on site, click "Offer a ride."
2. Sign in with `.illinois.edu` email (SSO or magic link).
3. Fill form: departure, destination, date & time, seats available, luggage capacity, suggested price per seat, car info (make/model/color — optional), notes (pet-friendly, music prefs etc).
4. Publish. Listing appears in the feed immediately.
5. Receive notifications when riders request the seat.

### 6.2 Rider finds and books a ride
1. Land on site, click "Find a ride."
2. Sign in with `.illinois.edu` email.
3. Filter by date, departure, destination, departure time window.
4. Browse listings. See driver's name, number of prior completed rides, price, seats & luggage left.
5. Click "Request seat." Driver receives notification and either confirms or declines within a time window (e.g., 24 hours).
6. On confirmation, contact details (email / phone) are revealed to both parties. Pickup point coordinated by themselves through the contacts.
7. Day-of: ride occurs. Payment handled out-of-band (Venmo/Zelle) in MVP.
8. Post-ride: both parties confirm the ride occurred (one-tap). Optional rating.

---

## 7. Functional Requirements

### 7.1 Identity & verification
- **FR-1:** Users must authenticate with a `.illinois.edu` email address (magic link or Google SSO restricted to that domain).
- **FR-2:** Email verification must be completed before posting or requesting.
- **FR-3:** User profile displays name, number of completed rides, and rating (v1+).
- **FR-4:** Users must accept a terms of service that explicitly covers privacy, liability limitations, and prohibited conduct.

### 7.2 Listings (ride posts)
- **FR-5:** Drivers can post a ride with: direction, date, departure window (e.g., "between 3pm–5pm"), seats available, luggage capacity, suggested price per seat, pickup zone, drop-off zone, optional notes.
- **FR-6:** Drop-off and pickup zones are predefined from a fixed list (e.g., CU: "Green St / Campustown," "ISR area," "Orchard Downs." Chicago: "Downtown/Loop," "ORD Terminal 1/2/3/5," "MDW," "North Side," "West Loop," "South Side," "Suburbs — specify"). 
- **FR-7:** Drivers can edit or cancel listings before confirmed bookings. After confirmation, cancellations require explicit notification to paired riders.
- **FR-8:** Listings auto-expire after the departure date.

### 7.3 Search & discovery
- **FR-9:** Public landing page shows a feed of upcoming rides filterable by date, direction, and destination, visible to all visitors.
- **FR-10:** Default sort: soonest departure; secondary sort: most seats available.
- **FR-11:** Empty state: show "no rides yet" with a prompt to post a request or subscribe to notifications for this route.

### 7.4 Booking & coordination
- **FR-12:** A rider can request a seat on any open listing. Driver receives email notification.
- **FR-13:** Driver confirms or declines. If no response within 24 hours, the request auto-expires.
- **FR-14:** On confirmation, both parties see each other's email and phone number. In-app chat optional for MVP.
- **FR-15:** A rider can hold only one unconfirmed request per listing and up to 3 unconfirmed requests total at a time.
- **FR-16:** Cancellation by either party triggers a notification to the counterparty. Cancellation reason is optional but tracked.

### 7.5 Payments
- **MVP:** Out-of-band (Venmo/Zelle/Cash). Price is suggested by driver at posting time. No platform fee, no escrow.
- **v1+:** Consider in-app payments with a platform fee (5–10%) and optional hold-until-ride-completed escrow.

### 7.6 Trust signals
- **FR-17:** Show count of completed rides on each profile.
- **FR-18 (v1):** Post-ride ratings (1–5 stars + optional text), mutual (riders rate drivers, drivers rate riders).
- **FR-19 (v1):** Simple report/block flow. Three unresolved reports → auto-suspend pending review.

### 7.7 Notifications
- **MVP:** Email on request, confirmation, decline, cancellation, recommend rides with windows similar to user's post, "alert me when a ride posts for X route on Y date.".
- **v1+:** SMS, push, in-app notifications & chats

### 7.8 Admin tools
- **FR-20:** Basic admin dashboard to view users, listings, reports; ability to suspend users and remove listings.

---

## 8. Non-Functional Requirements

- **NFR-1:** Mobile-web first. Must work well on phones in the browser; native apps deferred.
- **NFR-2:** Page loads <2s on 4G for logged-in feed.
- **NFR-3:** Uptime 99%+ during peak weekends (the days before/after major breaks are production-critical).
- **NFR-4:** Data residency: US-only. No PII exported beyond ops emails.
- **NFR-5:** GDPR/FERPA-adjacent hygiene: users can delete their account and associated personal data.
- **NFR-6:** Accessibility: meet WCAG 2.1 AA for the core flows.

---

## 9. Trust, Safety & Verification

This is the core differentiator. Treat it as a product pillar, not a checkbox.

- **`.illinois.edu` verification is table stakes.** Do not allow personal email.
- **Real-name policy:** (not required for MVP, only for v1+ and after) Profile uses the name on the `.illinois.edu` account; no anonymous handles.
- **Contact information exchange gated** until both parties confirm.
- **Visible social proof:** ride count, rating (v1), signup date.
- **Clear safety guidance:** pre-ride checklist surfaced to both parties (share trip details with a friend, confirm license plate, meet in a public location on campus, etc.).
- **Incident reporting:** visible "Report" link on every profile and ride page; 24-hour SLA for serious reports during MVP.
- **No minors:** terms restrict use to 18+.
- **No background checks in MVP.** Rely on university identity + rating + reporting. Revisit in v1+ if incidents occur.

---

## 10. Legal & Compliance Considerations

Do not build this without a lawyer reviewing the below. This section is a starting checklist, not legal advice.

- **TNC vs. cost-sharing carpool:** Illinois regulates Transportation Network Companies (TNCs) like Uber/Lyft with insurance and licensing requirements. Genuine cost-sharing carpools (where the driver is not profiting, only recouping gas/tolls) generally fall outside TNC regulation. The platform should:
  - Explicitly position itself as **cost-sharing only**.
  - Cap suggested prices at a "reasonable costs" threshold (e.g., IRS standard mileage rate or a platform-defined cap per route).
  - Prohibit drivers from listing "taxi-like" pricing.
- **Insurance:** Drivers' personal auto insurance may exclude coverage for compensated rides. The platform should require drivers to represent that they carry valid personal auto insurance and disclose that the platform does not provide supplemental commercial coverage in MVP. Commercial marketplace insurance is expensive; defer until v1+ if economics warrant.
- **Terms of service & liability waiver:** Clickwrap TOS with limitation of liability, arbitration clause, and explicit disclaimer that the platform is a listings board, not a transportation provider.
- **Accessibility/discrimination:** The "UIUC-only" restriction is a membership criterion, not a protected class, so generally permissible. Avoid any screening criteria that touch protected classes. (Note: Illinois has been burned before on this — see Suburban Express AG case — so be careful with messaging.)
- **University policy:** Check UIUC Student Code and any relevant transportation/commercial activity policies. Consider proactively engaging the Office of the Dean of Students.
- **Sales tax, 1099s, etc.:** Probably not triggered in MVP (no platform take-rate), but becomes relevant if in-app payments launch.

---

## 11. Business Model

### 11.1 MVP: no monetization
Free to validate liquidity first. Payments happen off-platform. Do not operate rides, only do information matching.

### 11.2 v1+ options (ranked by preference)
1. **Per-ride booking fee** ($1–$3) charged to rider at in-app checkout. Low friction, aligns with usage.
2. **Driver subscription** ($5–10/month) for unlimited posts with priority placement.
3. **Freemium for riders** with paid features (advance alerts, priority booking windows).
4. **Ads/partnerships** with local businesses near pickup points — probably too niche.

Explicitly avoid: taking a percentage of ride price (this pushes the product toward TNC territory).

---

## 12. MVP Definition

### 12.1 In scope for MVP
- `.illinois.edu` email auth (magic link).
- Single corridor: CU ↔ Chicago (downtown, ORD, MDW, plus "other Chicago area").
- Driver/rider posts a ride.
- Rider/driver browses and requests a seat/offer a ride.
- Driver/rider confirms/declines.
- Contact info exchanged after confirmation.
- Email notifications.
- Basic profile (name, ride count).
- Web (desktop + mobile web).
- Admin tools to suspend users and remove listings.
- TOS, privacy policy, safety checklist.

### 12.2 Explicitly out of scope for MVP
- In-app payments.
- In-app chat (use phone number + SMS/iMessage).
- Ratings.
- Background checks.
- Native mobile apps.
- Reverse listings (rider posting a request).
- Multi-stop routes.
- Other corridors (Indianapolis, St. Louis, etc.).
- Non-student users (staff, faculty, alumni).
- Rich search (only date + direction + zone filters).
- Recurring rides / scheduled posts.

### 12.3 Build estimate
With one full-stack developer (or you + a co-founder), this is a 3–6 week build. Stack suggestion: Next.js + Postgres + a transactional email service (Resend/Postmark) + simple deployment (Vercel/Railway). Auth via NextAuth or Clerk with domain restriction.

### 12.4 Why this MVP and not smaller?

The classic "smaller" MVP would be a curated GroupMe/Discord. That's been tried informally and exists already — the reason those channels don't win is discoverability and verification, which are exactly the features a minimal web product adds. Going smaller than a real verified marketplace doesn't test the hypothesis that matters.

### 12.5 Why this MVP and not bigger?

Payments, ratings, chat, mobile apps, and background checks all add weeks of work and legal complexity. None of them are required to prove the core hypothesis: can we get a meaningful number of students to match and complete rides on this platform? Ship, learn, then add.

### 12.6 Launch strategy (operational, not product)
- Launch 2–3 weeks before Thanksgiving or Spring break.
- Seed supply first: DM 20–30 students who already post rides on Facebook groups and ask them to cross-post on the new platform.
- Distribution: flyers at key locations (Grainger, Illini Union, dorms), posts to /r/UIUC, collaborations with RSOs (cultural orgs, out-of-state student groups) that have Chicagoland heavy memberships, targeted ads on Instagram geo-fenced to campus.
- Be willing to white-glove the first 50 matches: if a listing doesn't fill, personally reach out to riders looking for that route.

---

## 13. Phased Roadmap

### v0 — MVP (weeks 1–6)
Everything in §12.1. Launch before a major break.

### v1 — Trust & retention (weeks 7–14)
- Ratings (mutual).
- In-app chat (basic).
- SMS notifications.
- Report/block flow.
- Refined safety features.
- Grad student and staff expansion.

### v2 — Monetization & scale (weeks 15–26)
- In-app payments with booking fee.
- Refund and dispute handling.
- Native PWA or mobile app.
- Additional corridors: other towns in state; CU ↔ Indianapolis, CU ↔ St. Louis, CU ↔ Milwaukee/Madison...

### v3+ — Ecosystem (26 weeks+)
- Other universities that locates in small towns that are far from transportation hubs/anchor cities (e.g. UW-Madison, University of Notre Dame, Cornell).
- Recurring rides / commuter patterns.
- Driver "trusted" tier after N successful rides.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cold start: no drivers post | High | Critical | Seed with known drivers from FB groups before public launch; launch 2–3 weeks pre-break |
| Cold start: drivers post, no riders | Medium | High | Pre-register rider waitlist; flyer campaign on campus |
| Safety incident in MVP | Low–Medium | Critical | Strict verification, visible reporting, clear safety checklist, 24h SLA |
| Legal challenge (TNC classification) | Medium | High | Cost-sharing positioning, price cap, lawyer review before launch |
| University asks platform to stop | Low | High | Engage Office of Student Affairs proactively; position as student-led initiative |
| Competitor copies (Peoria Charter launches an app, or a well-funded startup enters) | Medium | Medium | Speed to community trust; partnerships with RSOs |
| Payment disputes | Medium | Low | Keep payments off-platform in MVP; add escrow in v1+ |
| No-shows / reliability erosion | High | Medium | Confirmation flow, ride-count reputation, ratings in v1 |
| Exclusion/discrimination accusations | Low–Medium | High | Clear membership rules (UIUC affiliation only, nothing else), no algorithmic matching bias, accessible design |

---

## 15. Open Questions & Assumptions

### Open questions

1. Who owns the product legally — an LLC, an RSO, or an individual? This affects liability exposure significantly.
2. What insurance does the platform carry, if any? Recommend: general liability at minimum before public launch.
3. Does the product require drivers to disclose their insurance carrier and policy number? Recommend: require self-attestation only in MVP.

### Key assumptions
- UIUC students will adopt a new web product if it is clearly better than Facebook groups, even without a mobile app.
- Supply (drivers) is the constraining side.
- `.illinois.edu` verification is sufficient trust signal in MVP (no background checks needed).
- Legal cost-sharing framing is defensible in Illinois.
- Peak-period demand is concentrated enough that MVP validation is possible within one travel window.

---

## 16. Appendix

### A. Unit economics per ride (illustrative)

- CU ↔ downtown Chicago: ~140 miles, ~2.5 hours
- Driver round-trip fuel cost (28mpg, $3.50/gal): ~$35
- Tolls round-trip: ~$10
- Driver total cost: ~$45
- 3 riders × $20 = $60 → driver nets $15 after costs (below minimum wage for time; safely cost-sharing)
- 3 riders × $30 = $90 → driver nets $45 (may start to look profit-generating; risk zone for TNC framing)
- **Suggested MVP price cap:** $25/seat CU↔downtown, $30/seat CU↔ORD or MDW

### B. Predefined zones (MVP)

**Champaign–Urbana:**
- Campustown / Green Street
- Engineering Campus
- ISR / North campus
- Orchard Downs / South campus
- Off-campus (specify in notes)

**Chicago area:**
- Downtown / Loop
- ORD (O'Hare)
- MDW (Midway)
- North Side (Lincoln Park, Lakeview, etc.)
- West Loop / River North
- South Side (Hyde Park, etc.)
- Near North / Streeterville
- Suburbs (specify in notes)

### C. Tech stack recommendation (opinionated)

- **Frontend/backend:** Next.js 14+ (app router), TypeScript
- **DB:** Postgres (Supabase or Neon for speed)
- **Auth:** Clerk or NextAuth, restricted to `@illinois.edu`
- **Email:** Resend or Postmark
- **Hosting:** Vercel (web) + managed Postgres
- **Analytics:** PostHog (free tier)
- **Error tracking:** Sentry (free tier)
- **Total monthly cost at MVP scale:** <$50
