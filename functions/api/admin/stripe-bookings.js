const SESSION1_SLUG  = '28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_SLUG  = '6oUdRb9mcd5a1GMfMn9IQ02';
const SESSION1_LABEL = 'Session 1 — 11 & 12 Jul';
const SESSION2_LABEL = 'Session 2 — 18 & 19 Jul';

function sessionToBooking(s, sessionLabel) {
  const cf = {};
  (s.custom_fields || []).forEach(f => {
    cf[f.key] = f.text?.value || f.numeric?.value || f.dropdown?.value || '';
  });
  return {
    id:         s.id,
    child_name: cf.child_name || '',
    child_age:  cf.child_age  || '',
    whatsapp:   cf.whatsapp   || '',
    booker:     s.customer_details?.name  || '',
    email:      s.customer_details?.email || '',
    session:    sessionLabel,
    amount:     s.amount_total != null ? '£' + (s.amount_total / 100).toFixed(2) : '',
    created_at: new Date(s.created * 1000).toISOString(),
  };
}

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
    // Identify payment link IDs by URL slug
    const plData = await stripeGet('/payment_links?limit=20', stripeKey);
    const labeledLinks = [];
    for (const pl of plData.data || []) {
      if (pl.url?.includes(SESSION1_SLUG))      labeledLinks.push({ id: pl.id, label: SESSION1_LABEL, url: pl.url });
      else if (pl.url?.includes(SESSION2_SLUG)) labeledLinks.push({ id: pl.id, label: SESSION2_LABEL, url: pl.url });
    }

    let bookings = [];

    if (labeledLinks.length > 0) {
      // Fetch sessions per payment link — guarantees correct session label
      for (const link of labeledLinks) {
        const csData = await stripeGet(
          '/checkout/sessions?limit=100&status=complete&payment_link=' + link.id,
          stripeKey
        );
        for (const s of csData.data || []) {
          bookings.push(sessionToBooking(s, link.label));
        }
      }
    } else {
      // Fallback: URL matching failed — show all complete sessions unlabelled
      const csData = await stripeGet('/checkout/sessions?limit=100&status=complete', stripeKey);
      for (const s of csData.data || []) {
        bookings.push(sessionToBooking(s, 'Bootcamp'));
      }
    }

    bookings.sort((a, b) => a.created_at.localeCompare(b.created_at));

    const out = { bookings, total: bookings.length };
    if (debug) out._debug = { labeledLinks, allPaymentLinks: plData.data?.map(p => ({ id: p.id, url: p.url })) };
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
