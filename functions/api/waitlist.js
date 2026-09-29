export async function onRequestPost(context) {
  try {
    const { name, email, session, child_age, whatsapp } = await context.request.json();

    if (!name?.trim() || !email?.trim() || !session?.trim() || !child_age?.toString().trim() || !whatsapp?.trim()) {
      return jsonResponse({ error: 'Please fill in all required fields.' }, 400);
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }

    await context.env.bunyaan_waitlist.prepare(
      'INSERT INTO waitlist (name, email, session, child_age, whatsapp) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      name.trim(),
      email.trim().toLowerCase(),
      session.trim(),
      child_age.toString().trim(),
      whatsapp.trim()
    ).run();

    notify(context, {
      subject: 'New waitlist signup: ' + name.trim(),
      rows: [
        ['Name',    name.trim()],
        ['Email',   email.trim()],
        ['Session', session.trim()],
        ['Age',     child_age.toString().trim()],
        ['WhatsApp',whatsapp.trim()],
      ],
    });

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
  }
}

function notify(context, { subject, rows }) {
  if (!context.env.RESEND_API_KEY) return;
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5f5;padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#0A1628;padding:20px 28px;border-bottom:3px solid #C9A84C;">
    <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:0.08em;">BUN<span style="color:#C9A84C;">YA</span>AN</span>
  </td></tr>
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 20px;font-size:15px;color:#111;font-weight:600;">${esc(subject)}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows.map(([k, v]) => `<tr>
        <td style="font-size:12px;color:#888;padding:5px 0;width:110px;vertical-align:top;">${esc(k)}</td>
        <td style="font-size:13px;color:#222;padding:5px 0;font-weight:500;">${esc(v || '–')}</td>
      </tr>`).join('')}
    </table>
  </td></tr>
  <tr><td style="padding:14px 28px;border-top:1px solid #eee;">
    <a href="https://bunyaan.org.uk/admin" style="font-size:12px;color:#C9A84C;text-decoration:none;">Open Admin Panel</a>
  </td></tr>
</table>
</body></html>`;
  context.waitUntil(fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + context.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Bunyaan <notifications@bunyaan.org.uk>', to: ['info@bunyaan.org.uk'], subject, html }),
  }).catch(() => {}));
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
