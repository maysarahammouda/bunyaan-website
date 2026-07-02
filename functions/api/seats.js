const SESSION1_SLUG = '28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_SLUG = '6oUdRb9mcd5a1GMfMn9IQ02';

export async function onRequest(context) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  const debug = new URL(context.request.url).searchParams.has('debug');

  try {
    const resp = await fetch('https://api.stripe.com/v1/payment_links?limit=20', {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Stripe-Version': '2023-10-16'
      }
    });

    if (!resp.ok) {
      return jsonResponse({ error: 'stripe_error', status: resp.status }, 500);
    }

    const data = await resp.json();

    if (debug) {
      // Returns only URLs and restriction data — no sensitive fields
      return jsonResponse({
        count: data.data.length,
        links: data.data.map(l => ({
          url: l.url,
          restrictions: l.restrictions
        }))
      });
    }

    const result = { session1: null, session2: null };

    for (const link of data.data) {
      const used = link.restrictions?.completed_sessions?.count ?? 0;
      const limit = link.restrictions?.completed_sessions?.limit ?? null;
      const remaining = limit !== null ? limit - used : null;

      if (link.url && link.url.includes(SESSION1_SLUG)) {
        result.session1 = { remaining, total: limit, used };
      } else if (link.url && link.url.includes(SESSION2_SLUG)) {
        result.session2 = { remaining, total: limit, used };
      }
    }

    return jsonResponse(result);
  } catch (e) {
    return jsonResponse({ error: 'internal_error', message: e.message }, 500);
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
