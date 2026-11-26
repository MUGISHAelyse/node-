// recommend.mjs: a small server function (runs on Netlify, not in the browser).
// The shopper's request and the product list come in; the AI model picks matching products.
// The secret key LOVABLE_API_KEY stays on the server and is never sent to the browser.

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/responses'
const MODEL = 'openai/gpt-6-astra'

// The exact shape the model must answer with.
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'picks'],
  properties: {
    summary: { type: 'string' },
    picks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
  },
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export default async req => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' })
  const key = process.env.LOVABLE_API_KEY
  if (!key) return json(500, { error: 'The AI helper is not set up yet (missing LOVABLE_API_KEY).' })

  let body
  try { body = await req.json() } catch { return json(400, { error: 'Bad request.' }) }
  const need = String(body?.need || '').trim().slice(0, 500)
  const products = Array.isArray(body?.products) ? body.products.slice(0, 200) : []
  if (need.length < 3) return json(400, { error: 'Tell us a little more about what you need.' })

  // Only send what the model needs to know.
  const catalog = products.map(p => ({
    id: String(p.id), name: String(p.name), category: String(p.category),
    price: Number(p.price), rating: Number(p.rating) || null, inStock: Number(p.stock) > 0,
    description: String(p.description || '').slice(0, 300),
  }))

  const upstream = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: 'low' },
      instructions:
        'You are a friendly shop assistant for Shopwise. Recommend 1 to 4 products from the catalog that best match the shopper. ' +
        'Only use ids from the catalog. Prefer in-stock items and respect any budget mentioned. ' +
        'Each reason is one short sentence addressed to the shopper. The summary is one or two sentences. ' +
        'If nothing fits, return an empty picks list and say so kindly in the summary.',
      input: `Catalog:\n${JSON.stringify(catalog)}\n\nShopper request: ${need}`,
      text: { format: { type: 'json_schema', name: 'recommendations', strict: true, schema } },
    }),
  })

  if (!upstream.ok) {
    let msg = 'The AI helper could not answer right now.'
    try { const e = await upstream.json(); msg = e?.error?.message || e?.message || msg } catch {}
    if (upstream.status === 429) msg = 'Too many requests right now. Please try again in a minute.'
    if (upstream.status === 402) msg = 'The AI helper has run out of credits. ' + msg
    return json(upstream.status, { error: msg })
  }

  // Read the streamed answer and collect the text pieces.
  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', text = '', refused = false
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let i
    while ((i = buffer.indexOf('\n\n')) >= 0) {
      const frame = buffer.slice(0, i); buffer = buffer.slice(i + 2)
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') continue
        try {
          const ev = JSON.parse(data)
          if (ev.type === 'response.output_text.delta') text += ev.delta
          if (ev.type === 'response.refusal.delta') refused = true
          if (ev.type === 'error' || ev.type === 'response.failed') {
            return json(502, { error: ev.error?.message || ev.response?.error?.message || 'The AI helper failed.' })
          }
        } catch {}
      }
    }
  }
  if (refused) return json(422, { error: 'The AI helper could not help with that request.' })

  let result
  try { result = JSON.parse(text) } catch { return json(502, { error: 'The AI helper gave an unreadable answer.' }) }
  const ids = new Set(catalog.map(p => p.id))
  const picks = (result.picks || []).filter(p => ids.has(String(p.id))).slice(0, 4)
  return json(200, { summary: String(result.summary || ''), picks })
}

export const config = { path: '/api/recommend' }
