const DECLARATION_VERSION = '2026-11';

export async function onRequestPost(context) {
  try {
    const { name, address, postcode, amount, frequency } = await context.request.json();
    const clip = (v, n) => String(v || '').trim().slice(0, n);
    const n = clip(name, 200), a = clip(address, 300), p = clip(postcode, 20);

    if (!n || !a || !p) {
      return Response.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }

    await context.env.bunyaan_waitlist.prepare(`
      INSERT INTO giftaid_declarations
        (name, address, postcode, amount, frequency, method, stripe_session_id, declaration_version)
      VALUES (?, ?, ?, ?, ?, 'bank', NULL, ?)
    `).bind(
      n, a, p,
      Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : null,
      frequency === 'once' || frequency === 'monthly' ? frequency : null,
      DECLARATION_VERSION,
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
