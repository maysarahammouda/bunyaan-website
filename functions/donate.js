export async function onRequestPost(context) {
  try {
    const { amount } = await context.request.json();
    const pence = Math.round(Number(amount) * 100);

    if (!pence || pence < 100 || pence > 1000000) {
      return Response.json({ error: 'Please enter an amount between £1 and £10,000.' }, { status: 400 });
    }

    const body = new URLSearchParams({
      'payment_method_types[]':                          'card',
      'line_items[0][price_data][currency]':             'gbp',
      'line_items[0][price_data][unit_amount]':          String(pence),
      'line_items[0][price_data][product_data][name]':   'Donation to Bunyaan',
      'line_items[0][price_data][product_data][description]':
        'Supporting Scotland\'s first Muslim community robotics and AI team for young people.',
      'line_items[0][quantity]':  '1',
      'mode':                     'payment',
      'success_url':              'https://www.bunyaan.org.uk/?donated=1#donate',
      'cancel_url':               'https://www.bunyaan.org.uk/#donate',
      'submit_type':              'donate',
    });

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

    return Response.json({ url: session.url });

  } catch (err) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
