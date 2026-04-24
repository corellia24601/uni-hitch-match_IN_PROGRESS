import { Resend } from 'resend'

type RideLite = {
  id: string
  role: 'driver' | 'passenger'
  departure: string
  arrival: string
  departAt: string
}

type PersonLite = {
  handle?: string
  name?: string
  email?: string
  phone?: string
}

type Submission = {
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

type RequestBody = {
  ride: RideLite
  owner: PersonLite
  from: PersonLite
  submission: Submission
}

const BRAND = 'Uni Hitch Match'
const MAIL_FROM = process.env.MAIL_FROM ?? 'notifications@mail.uni-hitch-match.win'
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO ?? 'hello@uni-hitch-match.win'
const SITE_URL = process.env.SITE_URL ?? 'https://uni-hitch-match.win'

function esc(s: string | undefined | null): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isValidEmail(e: string | undefined | null): boolean {
  if (!e) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
}

function buildEmail(body: RequestBody) {
  const { ride, owner, from, submission } = body
  const ownerRole = ride.role === 'driver' ? 'driver' : 'passenger'
  const interestRole = ride.role === 'driver' ? 'passenger' : 'driver'
  const departStr = new Date(ride.departAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const sharedLines: string[] = []
  if (submission.sharePhone && submission.phone) {
    sharedLines.push(`<li><strong>Phone:</strong> ${esc(submission.phone)}</li>`)
  }
  if (submission.shareEmail && submission.email) {
    sharedLines.push(`<li><strong>Email:</strong> ${esc(submission.email)}</li>`)
  }
  if (sharedLines.length === 0) {
    sharedLines.push('<li>(no contact shared — this is unusual, reach out through the app)</li>')
  }

  const extraRows: string[] = []
  if (typeof submission.seatsRequired === 'number') {
    extraRows.push(`<tr><td>Seats needed</td><td>${submission.seatsRequired}</td></tr>`)
  }
  if (typeof submission.luggageRequired === 'number') {
    extraRows.push(`<tr><td>Luggage needed</td><td>${submission.luggageRequired}</td></tr>`)
  }
  if (submission.expectedPrice) {
    extraRows.push(`<tr><td>Expected price</td><td>${esc(submission.expectedPrice)}</td></tr>`)
  }

  const subject = `New ride interest: ${ride.departure} → ${ride.arrival}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2d5bff; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8;">${BRAND}</p>
        <h1 style="margin: 4px 0 0; font-size: 20px; line-height: 1.3;">Someone is interested in your ride</h1>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="margin: 0 0 12px;">Hi @${esc(owner.handle) || 'there'},</p>
        <p style="margin: 0 0 16px;">
          <strong>@${esc(from.handle) || 'a rider'}</strong> is interested in your ride <strong>${esc(ride.departure)} → ${esc(ride.arrival)}</strong> on <strong>${esc(departStr)}</strong>. They&rsquo;re joining as a ${interestRole}.
        </p>

        <h2 style="font-size: 15px; margin: 20px 0 8px; color: #111827;">Contacts they shared</h2>
        <ul style="padding-left: 18px; margin: 0 0 16px;">
          ${sharedLines.join('\n')}
        </ul>

        <h2 style="font-size: 15px; margin: 20px 0 8px; color: #111827;">Request details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            <tr><td style="padding: 6px 0; color: #6b7280; width: 38%;">Pickup location</td><td style="padding: 6px 0;">${esc(submission.pickupLocation) || '—'}</td></tr>
            ${extraRows.map((r) => r.replace(/<td>/g, '<td style="padding: 6px 0; color: #6b7280;">').replace(/<\/td><td/, '</td><td style="padding: 6px 0;"')).join('\n')}
            ${
              submission.remarks
                ? `<tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Remarks</td><td style="padding: 6px 0; white-space: pre-wrap;">${esc(submission.remarks)}</td></tr>`
                : ''
            }
          </tbody>
        </table>

        <p style="margin: 24px 0 8px; font-size: 14px;">
          <strong>If it&rsquo;s a fit:</strong> reach out directly using the shared contacts above.
        </p>
        <p style="margin: 0 0 24px; font-size: 14px;">
          <strong>Not a fit?</strong> Just reply to this email with &ldquo;decline&rdquo; and we&rsquo;ll notify them politely.
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0 0 4px;">You received this because you posted a ride on ${BRAND} as a ${ownerRole}.</p>
          <p style="margin: 0;">Open the app: <a href="${SITE_URL}" style="color: #2d5bff;">${SITE_URL}</a></p>
        </div>
      </div>
    </div>
  `

  const textLines: string[] = [
    `${BRAND} — new ride interest`,
    '',
    `@${from.handle || 'a rider'} is interested in your ride ${ride.departure} -> ${ride.arrival} on ${departStr}. They're joining as a ${interestRole}.`,
    '',
    'Contacts they shared:',
  ]
  if (submission.sharePhone && submission.phone) textLines.push(`  Phone: ${submission.phone}`)
  if (submission.shareEmail && submission.email) textLines.push(`  Email: ${submission.email}`)
  textLines.push('', 'Request details:')
  textLines.push(`  Pickup location: ${submission.pickupLocation || '-'}`)
  if (typeof submission.seatsRequired === 'number') {
    textLines.push(`  Seats needed: ${submission.seatsRequired}`)
  }
  if (typeof submission.luggageRequired === 'number') {
    textLines.push(`  Luggage needed: ${submission.luggageRequired}`)
  }
  if (submission.expectedPrice) textLines.push(`  Expected price: ${submission.expectedPrice}`)
  if (submission.remarks) textLines.push(`  Remarks: ${submission.remarks}`)
  textLines.push('', 'If it fits, reach out via the shared contacts above.')
  textLines.push('Not a fit? Reply with "decline" and we\'ll notify them.')
  textLines.push('', `Open the app: ${SITE_URL}`)

  return { subject, html, text: textLines.join('\n') }
}

function validate(body: unknown): RequestBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (!b.ride || !b.owner || !b.from || !b.submission) return null
  const ride = b.ride as RideLite
  const owner = b.owner as PersonLite
  const from = b.from as PersonLite
  const submission = b.submission as Submission
  if (!ride.id || !ride.departure || !ride.arrival || !ride.departAt) return null
  if (!['driver', 'passenger'].includes(ride.role as string)) return null
  if (!isValidEmail(owner.email)) return null
  if (!submission.pickupLocation || typeof submission.pickupLocation !== 'string') return null
  if (submission.sharePhone && !submission.phone) return null
  if (submission.shareEmail && !isValidEmail(submission.email)) return null
  if (!submission.sharePhone && !submission.shareEmail) return null
  return { ride, owner, from, submission }
}

type VercelRequest = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (data: unknown) => void
  setHeader: (name: string, value: string) => void
  end: () => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }

  const payload = validate(req.body)
  if (!payload) {
    res.status(400).json({ ok: false, error: 'invalid_payload' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[send-interest] RESEND_API_KEY missing — skipping real send.')
    res.status(200).json({ ok: true, mode: 'dry-run' })
    return
  }

  try {
    const resend = new Resend(apiKey)
    const { subject, html, text } = buildEmail(payload)
    const replyTo = isValidEmail(payload.from.email)
      ? (payload.from.email as string)
      : MAIL_REPLY_TO

    const { data, error } = await resend.emails.send({
      from: `${BRAND} <${MAIL_FROM}>`,
      to: [payload.owner.email as string],
      replyTo: [replyTo, MAIL_REPLY_TO],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('[send-interest] resend error', error)
      res.status(502).json({ ok: false, error: 'send_failed', detail: error.message })
      return
    }

    res.status(200).json({ ok: true, id: data?.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error'
    console.error('[send-interest] unexpected', err)
    res.status(500).json({ ok: false, error: 'internal_error', detail: message })
  }
}
