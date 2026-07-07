const SESSION1_SLUG = '28E4gB9mc9SYbhmcAb9IQ01';
const SESSION2_SLUG = '6oUdRb9mcd5a1GMfMn9IQ02';

const CUSTOM_FIELDS = [
  { key: 'child_name', label: "Child's full name",               type: 'text'    },
  { key: 'child_age',  label: "Child's age",                     type: 'numeric' },
  { key: 'whatsapp',   label: "Parent / Guardian WhatsApp number", type: 'text'  },
];

const CONSENT_MSG =
  "By completing this payment, you confirm that you are the parent or guardian " +
  "of the child named above and consent to their participation in the Bunyaan " +
  "Summer Robotics Bootcamp.";

async function stripeGet(path, key) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    headers: { 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe ' + res.status);
  return data;
}

async function stripePost(path, params, key) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe ' + res.status);
  return data;
}

export async function onRequestPost(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonResponse({ error: 'STRIPE_SECRET_KEY not configured' }, 500);

  try {
    const plData = await stripeGet('/payment_links?limit=20', stripeKey);
    const results = [];

    for (const pl of plData.data || []) {
      const isS1 = pl.url?.includes(SESSION1_SLUG);
      const isS2 = pl.url?.includes(SESSION2_SLUG);
      if (!isS1 && !isS2) continue;

      const params = new URLSearchParams();
      CUSTOM_FIELDS.forEach((f, i) => {
        params.append(`custom_fields[${i}][key]`,           f.key);
        params.append(`custom_fields[${i}][label][type]`,   'custom');
        params.append(`custom_fields[${i}][label][custom]`, f.label);
        params.append(`custom_fields[${i}][type]`,          f.type);
      });
      params.append('custom_text[submit][message]', CONSENT_MSG);

      const updated = await stripePost('/payment_links/' + pl.id, params, stripeKey);
      results.push({
        id: pl.id,
        session: isS1 ? 'Session 1' : 'Session 2',
        customFieldsAdded: updated.custom_fields?.length || 0,
      });
    }

    if (results.length === 0) return jsonResponse({ error: 'No matching payment links found' }, 404);
    return jsonResponse({ success: true, updated: results });
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
