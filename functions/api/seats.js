const SESSION1_URL = 'https://buy.stripe.com/28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_URL = 'https://buy.stripe.com/6oUdRb9mcd5a1GMfMn9IQ02';

export async function onRequest(context) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;

  try {
    const resp = await fetch('https://api.stripe.com/v1/payment_links?limit=20', {
      headers: { 'Authorization': `Bearer ${stripeKey}` }
    });

    if (!resp.ok) {
      return jsonResponse({ error: 'stripe_error' }, 500);
    }

    const data = await resp.json();
    const result = { session1: null, session2: null };

    for (const link of data.data) {
      const used = link.restrictions?.completed_sessions?.count ?? 0;
      const limit = link.restrictions?.completed_sessions?.limit ?? null;
      const remaining = limit !== null ? limit - used : null;

      if (link.url === SESSION1_URL) {
        result.session1 = { remaining, total: limit, used };
      } else if (link.url === SESSION2_URL) {
        result.session2 = { remaining, total: limit, used };
      }
    }

    return jsonResponse(result);
  } catch {
    return jsonResponse({ error: 'internal_error' }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
