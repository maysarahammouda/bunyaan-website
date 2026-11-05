const DECLARATION_VERSION = '2026-11';

export async function onRequestPost(context) {
  try {
    const { amount, frequency, giftAid } = await context.request.json();
    const pence = Math.round(Number(amount) * 100);

    if (!pence || pence < 100 || pence > 1000000) {
      return Response.json({ error: 'Please enter an amount between £1 and £10,000.' }, { status: 400 });
    }
    if (frequency !== 'once' && frequency !== 'monthly') {
      return Response.json({ error: 'Please choose one-off or monthly.' }, { status: 400 });
    }

    const monthly = frequency === 'monthly';
    const clip = (v) => String(v || '').trim().slice(0, 450);
    const ga = giftAid && typeof giftAid === 'object' && giftAid.name && giftAid.address && giftAid.postcode
      ? { name: clip(giftAid.name), address: clip(giftAid.address), postcode: clip(giftAid.postcode) }
      : null;

    const meta = {
      gift_aid:               ga ? 'yes' : 'no',
      ga_name:                ga ? ga.name : '',
      ga_address:             ga ? ga.address : '',
      ga_postcode:            ga ? ga.postcode : '',
      ga_declaration_version: DECLARATION_VERSION,
    };

    const body = new URLSearchParams({
      'line_items[0][price_data][currency]':             'gbp',
      'line_items[0][price_data][unit_amount]':          String(pence),
      'line_items[0][price_data][product_data][name]':   monthly ? 'Monthly donation to Bunyaan' : 'Donation to Bunyaan',
      'line_items[0][price_data][product_data][description]':
        'Supporting Scotland\'s first Muslim community robotics and AI team for young people.',
      'line_items[0][quantity]':  '1',
      'success_url':              'https://www.bunyaan.org.uk/?donated=1&freq=' + frequency + '#donate',
      'cancel_url':               'https://www.bunyaan.org.uk/#donate',
    });

    body.append('payment_method_types[]', 'card');
    if (monthly) {
      body.append('payment_method_types[]', 'bacs_debit');
      body.set('mode', 'subscription');
      body.set('line_items[0][price_data][recurring][interval]', 'month');
    } else {
      body.set('mode', 'payment');
      body.set('submit_type', 'donate');
    }

    const target = monthly ? 'subscription_data' : 'payment_intent_data';
    for (const [k, v] of Object.entries(meta)) {
      body.set('metadata[' + k + ']', v);
      body.set(target + '[metadata][' + k + ']', v);
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method:  'POST',
      headers: {
        'Authorization':  'Bearer ' + context.env.STRIPE_SECRET_KEY,
        'Content-Type':   'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const session = await res.json();

    if (!res.ok) {
      return Response.json({ error: session.error?.message || 'Stripe error.' }, { status: 500 });
    }

    return Response.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
