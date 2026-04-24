import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async () => {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString()
  const { error } = await supabase
    .from('notification_events')
    .delete()
    .lt('created_at', cutoff)
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
    })
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})

