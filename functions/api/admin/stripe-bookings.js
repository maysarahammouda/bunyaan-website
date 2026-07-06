const SESSION1_SLUG = '28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_SLUG = '6oUdRb9mcd5a1GMfMn9IQ02';

async function stripeGet(path, key) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    headers: { 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe error ' + res.status);
  return data;
}

export async function onRequest(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonResponse({ error: 'Stripe not configured' }, 500);

  try {
    // Build map of payment link ID -> session label
    const plData = await stripeGet('/payment_links?limit=20', stripeKey);
    const linkLabels = {};
    for (const pl of plData.data || []) {
      if (pl.url.includes(SESSION1_SLUG)) linkLabels[pl.id] = 'Session 1 - 26 Jul';
      else if (pl.url.includes(SESSION2_SLUG)) linkLabels[pl.id] = 'Session 2 - 2 Aug';
    }

    // Fetch all completed paid checkout sessions (up to 100 — enough for a 40-seat bootcamp)
    const csData = await stripeGet(
      '/checkout/sessions?limit=100&payment_status=paid&status=complete',
      stripeKey
    );

    const bookings = (csData.data || [])
      .filter(s => s.payment_link && linkLabels[s.payment_link])
      .map(s => ({
        id:         s.id,
        name:       s.customer_details?.name  || '',
        email:      s.customer_details?.email || '',
        phone:      s.customer_details?.phone || '',
        session:    linkLabels[s.payment_link],
        amount:     s.amount_total != null ? '£' + (s.amount_total / 100).toFixed(2) : '',
        created_at: new Date(s.created * 1000).toISOString(),
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    return jsonResponse({ bookings, total: bookings.length });
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
