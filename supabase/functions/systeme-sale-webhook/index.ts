import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const encoder = new TextEncoder()

function normalize(json: unknown) {
  return JSON.stringify(json)
    .replaceAll('/', '\\/')
    .replace(/[\u007f-\uffff]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

async function signature(body: unknown, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(normalize(body))))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async request => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const secret = Deno.env.get('SYSTEME_WEBHOOK_SECRET')
  if (!secret) return new Response('Webhook not configured', { status: 500 })

  let payload: Record<string, unknown>
  try { payload = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  const received = request.headers.get('x-webhook-signature') || ''
  const expected = await signature(payload, secret)
  if (received.length !== expected.length || !crypto.timingSafeEqual(encoder.encode(received), encoder.encode(expected))) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = request.headers.get('x-webhook-event') || ''
  if (event !== 'NEW_SALE') return Response.json({ ignored: true })
  const data = (payload.data || payload) as Record<string, any>
  const email = String(data.customer?.email || data.contact?.email || '').trim().toLowerCase()
  const amount = Number(data.offer_price_plan?.direct_charge_amount || data.order?.amount || 0)
  if (!email) return new Response('Missing customer email', { status: 400 })

  const offers: Record<number, [string, number]> = {
    1999: ['3_months', 90],
    3999: ['6_months', 180],
    5999: ['12_months', 365],
  }
  const offer = offers[amount]
  if (!offer) return new Response('Unknown NutriChef offer', { status: 400 })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: current } = await supabase.from('nutrichef_entitlements').select('access_expires_at').eq('email', email).maybeSingle()
  const base = current?.access_expires_at && new Date(current.access_expires_at) > new Date() ? new Date(current.access_expires_at) : new Date()
  base.setUTCDate(base.getUTCDate() + offer[1])
  const { error } = await supabase.from('nutrichef_entitlements').upsert({ email, plan: offer[0], access_expires_at: base.toISOString(), updated_at: new Date().toISOString() })
  if (error) return new Response('Could not update access', { status: 500 })
  return Response.json({ ok: true })
})
