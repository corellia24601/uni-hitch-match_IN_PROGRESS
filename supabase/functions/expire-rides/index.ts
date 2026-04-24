import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async () => {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('rides')
    .update({ lifecycle: 'expired' })
    .lt('expires_at', now)
    .in('lifecycle', ['open', 'full'])
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
    })
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})

