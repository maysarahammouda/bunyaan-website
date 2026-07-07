const SESSION1_SLUG = '28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_SLUG = '6oUdRb9mcd5a1GMfMn9IQ02';

async function stripeGet(path, key) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    headers: { 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe ' + res.status);
  return data;
}

export async function onRequest(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonResponse({ error: 'STRIPE_SECRET_KEY not configured' }, 500);

  const debug = new URL(context.request.url).searchParams.get('debug') === '1';

  try {
    // Build payment link ID -> session label map (non-fatal if it fails)
    let linkLabels = {};
    let plDebug = null;
    try {
      const plData = await stripeGet('/payment_links?limit=20', stripeKey);
      plDebug = (plData.data || []).map(pl => ({ id: pl.id, url: pl.url }));
      for (const pl of plData.data || []) {
        if (pl.url?.includes(SESSION1_SLUG))      linkLabels[pl.id] = 'Session 1 - 26 Jul';
        else if (pl.url?.includes(SESSION2_SLUG)) linkLabels[pl.id] = 'Session 2 - 2 Aug';
      }
    } catch (e) {
      plDebug = { error: e.message };
    }

    // Fetch all completed checkout sessions and keep only paid ones
    const csData = await stripeGet('/checkout/sessions?limit=100&status=complete', stripeKey);

    const bookings = (csData.data || [])
      .map(s => ({
        id:         s.id,
        name:       s.customer_details?.name  || '',
        email:      s.customer_details?.email || '',
        phone:      s.customer_details?.phone || '',
        session:    s.payment_link ? (linkLabels[s.payment_link] || 'Bootcamp') : 'Direct',
        amount:     s.amount_total != null ? '£' + (s.amount_total / 100).toFixed(2) : '',
        created_at: new Date(s.created * 1000).toISOString(),
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    const out = { bookings, total: bookings.length };
    if (debug) out._debug = {
      linkLabels,
      paymentLinks: plDebug,
      rawSessions: (csData.data || []).map(s => ({
        id: s.id, status: s.status, payment_status: s.payment_status,
        payment_link: s.payment_link, amount_total: s.amount_total, created: s.created,
      })),
    };
    return jsonResponse(out);
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
