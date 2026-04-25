import { createClient } from '@supabase/supabase-js'

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

function parseBody(raw: unknown): { rideId?: string } {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as { rideId?: string }
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    const o = raw as Record<string, unknown>
    const rideId = typeof o.rideId === 'string' ? o.rideId : undefined
    return { rideId }
  }
  return {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }

  const auth = req.headers.authorization
  const token =
    typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''

  if (!token) {
    res.status(401).json({ ok: false, error: 'missing_bearer_token' })
    return
  }

  const url = process.env.SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY

  if (!url || !anon) {
    res.status(503).json({ ok: false, error: 'supabase_env_missing' })
    return
  }

  const admin = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData.user) {
    res.status(401).json({ ok: false, error: 'invalid_session' })
    return
  }

  const scoped = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: profile, error: profErr } = await scoped
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userData.user.id)
    .single()

  if (profErr || !profile?.is_admin) {
    res.status(403).json({ ok: false, error: 'admin_only' })
    return
  }

  const { rideId } = parseBody(req.body)
  if (!rideId) {
    res.status(400).json({ ok: false, error: 'rideId_required' })
    return
  }

  const { error: delErr } = await scoped.from('rides').delete().eq('id', rideId)

  if (delErr) {
    res.status(500).json({ ok: false, error: 'delete_failed', detail: delErr.message })
    return
  }

  res.status(200).json({ ok: true })
}
