# Deploying uni-hitch-match.win

This doc takes you from "code on my laptop" to a live site at **https://uni-hitch-match.win** that sends real email when someone clicks **I'm interested**.

## Architecture

```
Browser (uni-hitch-match.win)
   │   click "I'm interested" → submit form
   ▼
Vercel static site (this repo)
   │   POST /api/send-interest
   ▼
Vercel serverless function (api/send-interest.ts)
   │   uses RESEND_API_KEY
   ▼
Resend (sends mail FROM notifications@mail.uni-hitch-match.win)
   │
   ▼
Ride owner's inbox
   │   replies to hello@uni-hitch-match.win
   ▼
Zoho Mail (you read replies here)
```

- **Domain**: `uni-hitch-match.win` (registered at Cloudflare)
- **Registrar / DNS**: Cloudflare
- **Web host**: Vercel
- **Outbound mail**: Resend, from subdomain `mail.uni-hitch-match.win`
- **Inbound mail**: Zoho Mail, on apex `uni-hitch-match.win`
- **Brand shown in emails**: `Uni Hitch Match`
- **Sender address**: `notifications@mail.uni-hitch-match.win`
- **Reply-to**: `hello@uni-hitch-match.win`

The split (sending on `mail.`, inbox on apex) is intentional. It keeps the inbox's reputation independent of Resend and is the setup major senders use.

---

## Step 1 — Push this repo to GitHub

```
git init
git add .
git commit -m "initial commit"
# create a repo on github.com first, then:
git remote add origin https://github.com/<you>/uni-hitch-match.git
git push -u origin main
```

## Step 2 — Deploy to Vercel

1. Go to https://vercel.com, sign up with GitHub.
2. **Add New Project** → import the repo you just pushed.
3. Vercel auto-detects Vite. Leave all defaults (Framework: **Vite**, Build Command: `npm run build`, Output: `dist`). The `vercel.json` in this repo confirms that.
4. Click **Deploy**. You'll get a temporary URL like `uni-hitch-match-xxxx.vercel.app`.
5. In the project, go to **Settings → Domains** → add `uni-hitch-match.win` AND `www.uni-hitch-match.win`. Vercel will show you two DNS records — keep that tab open for Step 4.

## Step 3 — Sign up for Resend (sender) and Zoho (inbox)

### Resend
1. https://resend.com → sign up.
2. **Domains → Add Domain**. Enter `mail.uni-hitch-match.win` (the subdomain — not the apex).
3. Resend shows 3 DNS records (SPF TXT, DKIM TXT/CNAME, a return-path CNAME). Keep that tab open.
4. **API Keys → Create API Key**. Name it `uni-hitch-match prod`. Copy the `re_...` value once — you'll paste it into Vercel in Step 5.

### Zoho Mail (free plan)
1. https://www.zoho.com/mail/ → sign up (Forever Free Plan, up to 5 users).
2. **Admin Console → Domains → Add Domain** → `uni-hitch-match.win`.
3. Zoho asks you to verify via a TXT record and then provides MX + DKIM records. Keep that tab open.
4. Create the mailbox `hello@uni-hitch-match.win`. Optionally add `notifications@uni-hitch-match.win` too — harmless alias, but the app sends from the `mail.` subdomain so Zoho doesn't actually need to handle that address.

---

## Step 4 — Cloudflare DNS (the one place you paste everything)

Go to https://dash.cloudflare.com → pick `uni-hitch-match.win` → **DNS → Records**.

For EVERY record below that points to Vercel or is used for mail: set **Proxy status → DNS only (gray cloud)**. Orange cloud breaks Vercel's SSL cert and mangles mail records.

### 4a. Web hosting (from Vercel's domain setup page)

Vercel usually gives you these two. Use the **exact values shown in Vercel** — they may differ slightly.

| Type  | Name | Value                  | Proxy     |
|-------|------|------------------------|-----------|
| A     | `@`  | `76.76.21.21`          | DNS only  |
| CNAME | `www`| `cname.vercel-dns.com` | DNS only  |

> If Vercel shows different values on your domain page, **use Vercel's values**, not these. Vercel is the source of truth for its own records.

### 4b. Resend (outbound mail on `mail.uni-hitch-match.win`)

Resend will show you 3 records tied to the `mail` subdomain. They'll look like these (the actual token strings vary per account):

| Type  | Name (Cloudflare field)                         | Value (from Resend)                                    | Proxy    |
|-------|-------------------------------------------------|--------------------------------------------------------|----------|
| TXT   | `mail`                                          | `v=spf1 include:amazonses.com ~all`                    | —        |
| TXT   | `resend._domainkey.mail`                        | `p=MIGfMA0GCSqG... ` (long DKIM key from Resend)       | —        |
| MX    | `send.mail` (or similar, per Resend)            | `feedback-smtp.us-east-1.amazonses.com` pri `10`       | —        |

**Copy the exact values from your Resend dashboard**; the table above is just the shape. Cloudflare's "Name" field only takes the subdomain portion (e.g. type `mail` not `mail.uni-hitch-match.win`).

Once saved, hit **Verify DNS Records** in Resend. Usually ready within 2 minutes, sometimes up to an hour.

### 4c. Zoho (inbound mail on apex `uni-hitch-match.win`)

From Zoho's domain setup page:

| Type | Name | Value                          | Priority | Notes                                |
|------|------|--------------------------------|----------|--------------------------------------|
| MX   | `@`  | `mx.zoho.com`                  | `10`     | primary mail server                  |
| MX   | `@`  | `mx2.zoho.com`                 | `20`     |                                      |
| MX   | `@`  | `mx3.zoho.com`                 | `50`     |                                      |
| TXT  | `@`  | `v=spf1 include:zoho.com ~all` | —        | SPF for apex — **only one SPF TXT per name allowed** |
| TXT  | `zmail._domainkey` (or the name Zoho gives) | `v=DKIM1; k=rsa; p=...` (from Zoho) | — | DKIM         |
| TXT  | `@`  | `zoho-verification=zb...` (from Zoho)  | —        | one-time domain verification         |

> Zoho's region matters — if you signed up under `zoho.eu` or `zoho.in`, use their regional MX hosts (e.g. `mx.zoho.eu`). Copy from Zoho's setup page, not this doc.

### 4d. DMARC (one combined record, covers both senders)

Add this at the apex to monitor alignment across Zoho + Resend:

| Type | Name     | Value                                                                 |
|------|----------|-----------------------------------------------------------------------|
| TXT  | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@uni-hitch-match.win; fo=1; adkim=r; aspf=r` |

Start with `p=none` (report-only) for 2 weeks, then upgrade to `p=quarantine` once you see DKIM/SPF both passing in the DMARC reports.

### 4e. Verify in Cloudflare

After adding everything, run in PowerShell or any terminal:

```
nslookup -type=TXT mail.uni-hitch-match.win
nslookup -type=MX  uni-hitch-match.win
nslookup -type=TXT uni-hitch-match.win
```

You should see your SPF, MX, and DMARC records.

---

## Step 5 — Vercel environment variables

In Vercel: **Project → Settings → Environment Variables**. Add for **Production** (and optionally Preview + Development):

| Name              | Value                                        |
|-------------------|----------------------------------------------|
| `RESEND_API_KEY`  | `re_...` (from Resend, Step 3)               |
| `MAIL_FROM`       | `notifications@mail.uni-hitch-match.win`     |
| `MAIL_REPLY_TO`   | `hello@uni-hitch-match.win`                  |
| `SITE_URL`        | `https://uni-hitch-match.win`                |

After adding, click **Redeploy** (the top-right **⋯** menu on the latest deployment → Redeploy with existing build cache off). Env vars are only baked in on the next deploy.

---

## Step 6 — Smoke test

1. Open https://uni-hitch-match.win.
2. Sign up (pick an `@illinois.edu` email you control) or pick a seeded account.
3. Post a ride from one account, switch to another account, click **I'm interested** → fill the form → submit.
4. Check the ride owner's inbox. You should receive a message from **Uni Hitch Match** `<notifications@mail.uni-hitch-match.win>`, subject `New ride interest: ...`.
5. Hit **Reply**. It should thread to `hello@uni-hitch-match.win` → show up in Zoho.
6. In Vercel **→ Deployments → Functions → send-interest**, you can see request logs (no body, for privacy — only the status). In Resend's dashboard → **Logs**, you see the actual sent emails.

---

## Troubleshooting

**Emails go to spam.**
- Make sure DKIM passes in the received email's headers (`Authentication-Results: ... dkim=pass`).
- Wait for `p=none` DMARC reports (Gmail + Outlook send these daily to `rua`) to confirm SPF + DKIM are aligned.
- Avoid trigger words in the subject in future template edits.
- Don't include `bcc` fanouts. We only ever send to one recipient.

**"Domain not verified" in Resend.**
- Cloudflare proxy on the SPF/DKIM records is the #1 cause — make sure they're all **DNS only** (gray cloud). TXT and MX records aren't proxyable anyway, but sometimes Cloudflare ignores the checkbox.
- TTL: Cloudflare default is Auto (≈5 min). Allow 10–15 min.

**POST /api/send-interest returns 500.**
- Check Vercel function logs. Most common: `RESEND_API_KEY` missing → response will be `{ ok: true, mode: "dry-run" }`, not a 500. A 500 usually means the API key is invalid.

**Cloudflare + Vercel: orange cloud on the A record.**
- If you leave the A record proxied, Vercel can't issue the SSL cert. Make it DNS only (gray cloud). Cloudflare's SSL/TLS page must be set to **Full (strict)** if you ever turn the proxy back on later.

---

## Cost

- Vercel Hobby: **free** (includes serverless functions, enough for this app).
- Cloudflare DNS: **free**.
- Resend: **free** up to 3,000 emails / month, then $20 / mo for 50k.
- Zoho Mail Free: **free** up to 5 users, 5 GB / user.

Total at launch: **$0 / month** + the cost of the domain itself.
