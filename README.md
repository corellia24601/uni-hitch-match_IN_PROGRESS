# Uni Hitch Match

**Live site:** [https://uni-hitch-match.win](https://uni-hitch-match.win)

Uni Hitch Match is a **non-profit, student-run bulletin board** for long-distance rides between the Champaign–Urbana campus area and Chicagoland (downtown, **ORD**, **MDW**, and nearby). It is **not** affiliated with the University of Illinois or any official transportation service.

The product wedge is the same one described in the [Product Requirement Document](./Product-Requirement-Document.md): combine the flexibility of informal carpooling with **discoverability** and **trust**—here, membership is limited to people who sign up with an `@illinois.edu` school email. The platform **connects** drivers and riders; **you set the price, you make the plan, and you coordinate payment off-platform** (e.g. Venmo, Zelle, cash), consistent with a cost-sharing listing board rather than a ride-hailing app.

## What you can do today

- Browse **rides offering** (drivers) and **rides seeking** (passengers) on a shared board with filters (dates, endpoints, seats, luggage, sort).
- **Post** a ride or request (demo data + local persistence; optional Supabase path exists behind feature flags).
- **Sign up / log in** with U of I email and phone (UI flow; production verification depends on your backend setup).
- Express interest with **I’m interested**: a structured form (pickup, price expectations, remarks, contact sharing) that, when deployed with [Resend](https://resend.com), emails the ride owner via a Vercel serverless function.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 8](https://vitejs.dev/)
- Styling: CSS variables and a single app stylesheet (`src/App.css`)
- Optional persistence: [Supabase](https://supabase.com/) (`@supabase/supabase-js`), toggled via `src/lib/flags.ts`
- Email (production): [Resend](https://resend.com) from `api/send-interest.ts` on [Vercel](https://vercel.com/)

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

Other scripts:

```bash
npm run build    # production build
npm run preview  # serve dist locally
npm run test     # unit tests (Vitest)
npm run lint     # ESLint
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Vercel, custom domain (`uni-hitch-match.win`), Cloudflare DNS, Resend (outbound on the same apex domain as Zoho, with a merged SPF record), and Zoho Mail (inbound replies).

Environment variables for email are documented in `.env.example`.

## Repository layout (high level)

| Path | Purpose |
|------|---------|
| `src/AppShell.tsx` | App chrome, tabs, auth and interest modals |
| `src/features/rides/` | Ride board, cards, interest modal |
| `src/features/auth/` | Sign-up / login modal |
| `src/lib/useAppStore.ts` | Client state, interest submission + optional API call |
| `api/send-interest.ts` | Vercel function: sends owner notification email via Resend |

## Product direction

Goals, personas, competitive framing, MVP scope, legal checklist, and roadmap live in **[Product Requirement Document](./Product-Requirement-Document.md)**. That file is the source of truth for *why* the product exists; this README describes *what* is in the repo and *how* to run and ship it.

## Disclaimer

This software and [uni-hitch-match.win](https://uni-hitch-match.win) are **independent student/community projects**, not endorsed by UIUC. Rides and payments are **arrangements between users**. Review the PRD’s trust, safety, and legal sections before scaling usage.

## License

This project is private unless you add a `LICENSE` file. Specify terms before open-sourcing.
