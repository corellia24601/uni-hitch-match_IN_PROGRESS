// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

async function run() {
  const { data, error } = await supabase
    .from('notification_events')
    .select('*')
    .eq('status', 'queued')
    .limit(100)
  if (error) throw error

  for (const evt of data ?? []) {
    // Hook your provider (Resend/SendGrid) here.
    const ok = true
    await supabase
      .from('notification_events')
      .update({ status: ok ? 'sent' : 'failed' })
      .eq('id', evt.id)
  }
}

Deno.serve(async () => {
  try {
    await run()
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
    })
  }
})

