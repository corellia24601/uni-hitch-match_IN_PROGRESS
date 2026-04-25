# Real administrator setup (Supabase + Vercel)

The public site at [uni-hitch-match.win](https://uni-hitch-match.win) currently stores data in **each visitor’s browser** (`localStorage`). The seeded `admin@illinois.edu` account is **demo-only** and is not shared across devices or users.

A **real** administrator requires:

1. **Supabase** — auth, `profiles`, `rides`, and Row Level Security (RLS).  
2. **Your user row** with `is_admin = true` in `profiles`.  
3. **The React app wired to Supabase Auth + database** (replacing fake login and `localStorage`).  
4. Optional: **Admin API** on Vercel to moderate content with a **real** session token.

This repo already includes SQL in `supabase/migrations/`. Below is the order to run things and what to configure.

---

## Phase 1 — Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (choose a region close to users).
2. Wait until the project is **healthy**.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`  
   Never expose the **service_role** key in the browser or in `VITE_*` variables.

---

## Phase 2 — Run SQL migrations

In the Supabase dashboard: **SQL Editor**.

1. Paste and run the full contents of  
   `supabase/migrations/20260421_full_expansion.sql`  
   (creates tables, RLS, indexes).
2. Run  
   `supabase/migrations/20260425_auth_profile_bootstrap.sql`  
   (creates `handle_new_user` so every new auth user gets a `profiles` row; **only `@illinois.edu`** emails are allowed).
3. Run  
   `supabase/migrations/20260425_admin_moderation_rls.sql`  
   (admins may **update/delete any ride** and **read all notification_events**).

If a statement errors because something already exists, read the message: you may need to adjust or skip that block.

---

## Phase 3 — Enable email sign-in (magic link / OTP)

1. **Authentication → Providers → Email** → enable **Email**, **Confirm email** as you prefer.
2. **Authentication → URL configuration** → set **Site URL** to `https://uni-hitch-match.win` (and add the same under **Redirect URLs** if you use magic links).
3. (Optional) Tighten templates and rate limits under **Authentication**.

Users must sign up with an address ending in **`@illinois.edu`** or the profile trigger will **reject** the signup.

---

## Phase 4 — Create your account and promote yourself to admin

1. Use the Supabase **Auth** UI or your app (once wired) to sign up with your real **`netid@illinois.edu`**.
2. Confirm the row exists: **Table Editor → profiles** — you should see `is_admin = false`.
3. In **SQL Editor** (run once, replace email):

```sql
update public.profiles
set is_admin = true
where lower(school_email) = lower('YOUR_NETID@illinois.edu');
```

4. Verify: `select user_id, school_email, is_admin from public.profiles;`

**Security:** Only people who can run SQL in this Supabase project can grant `is_admin`. Do not build a public “make me admin” button.

---

## Phase 5 — Vercel environment variables

In **Vercel → Project → Settings → Environment Variables** (Production):

| Name | Purpose |
|------|--------|
| `SUPABASE_URL` | Same as Project URL |
| `SUPABASE_ANON_KEY` | anon public key (used by `/api/admin/delete-ride` to validate JWT + run RLS) |
| Existing `RESEND_*`, `MAIL_*`, `SITE_URL` | Unchanged |

**Frontend (after you wire Supabase Auth in the app):**

| Name | Purpose |
|------|--------|
| `VITE_SUPABASE_URL` | Project URL (exposed to browser) |
| `VITE_SUPABASE_ANON_KEY` | anon key (exposed to browser) |

Redeploy after any change.

---

## Phase 6 — Admin API smoke test (delete a ride)

This works **after** Phase 2–4 and only for rows that exist **in Supabase** (not `localStorage`).

1. Obtain a **current access token** (JWT) for your admin user — e.g. from the browser after real Supabase login (`supabase.auth.getSession()`), or from Supabase **Auth → Users** → impersonation / devtools depending on your setup.
2. Replace `YOUR_JWT` and `RIDE_UUID`:

```bash
curl -sS -X POST "https://uni-hitch-match.win/api/admin/delete-ride" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"rideId\":\"RIDE_UUID\"}"
```

Success: `{"ok":true}`. Errors: `admin_only` (not an admin), `invalid_session`, etc.

---

## Phase 7 — Wire the React app (required for “real” product)

Until this is done, visitors still use **localStorage** and the demo admin.

Planned work (not all implemented in this repo yet):

1. **Auth modal** — replace demo codes with `supabase.auth.signInWithOtp({ email })` and `verifyOtp`.
2. **Session** — `onAuthStateChange`, store session, pass `access_token` where needed.
3. **Data** — replace `localRepository` with loads from `rides` / `profiles` (or enable `featureFlags.backendMode` and implement `supabaseRepository`).
4. **Admin UI** — call `/api/admin/delete-ride` with `Authorization: Bearer ${session.access_token}`, or use Supabase client `.delete()` directly (RLS allows admins after migration).

Track this as a dedicated milestone; it touches most of `useAppStore`, `AuthModal`, and ride CRUD.

---

## Summary

| Piece | Status in repo |
|--------|------------------|
| DB schema + RLS + `is_admin` | `20260421_full_expansion.sql` |
| Profile auto-create on signup | `20260425_auth_profile_bootstrap.sql` |
| Admin can delete/update any ride | `20260425_admin_moderation_rls.sql` |
| Vercel admin endpoint | `api/admin/delete-ride.ts` |
| SPA uses Supabase for auth/data | **You still need to implement Phase 7** |

For deployment basics (domain, Resend, DNS), see [DEPLOY.md](./DEPLOY.md).
