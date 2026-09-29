export async function onRequestPost(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  if (!context.env.RESEND_API_KEY) {
    return jsonResponse({ error: 'RESEND_API_KEY is not configured' }, 500);
  }

  const { session_id, email, booker, participant, session, template_id } = await context.request.json();
  if (!session_id || !email) {
    return jsonResponse({ error: 'Missing session_id or email' }, 400);
  }

  const sessionDetails = resolveSessionDetails(session);
  const vars = {
    participant:   participant || booker || 'your child',
    booker:        booker || 'Parent/Guardian',
    session_dates: sessionDetails.dates,
    session_time:  sessionDetails.time,
  };

  let subject, fullHtml;

  if (template_id) {
    const tmpl = await context.env.bunyaan_waitlist.prepare(
      'SELECT subject, body FROM email_templates WHERE id = ?'
    ).bind(Number(template_id)).first();
    if (!tmpl) return jsonResponse({ error: 'Template not found' }, 404);
    subject  = subVarsText(tmpl.subject, vars);
    fullHtml = wrapEmail(subVarsHtml(tmpl.body, vars));
  } else {
    subject  = 'Your Bunyaan Summer Robotics Bootcamp booking is confirmed';
    fullHtml = buildLegacyEmail({ booker, participant, sessionDetails });
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + context.env.RESEND_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'Bunyaan <bootcamp@bunyaan.org.uk>',
      to:      [email],
      subject,
      html:    fullHtml,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}));
    return jsonResponse({ error: err.message || 'Resend error: HTTP ' + resendRes.status }, 500);
  }

  const now = new Date().toISOString();
  await context.env.bunyaan_waitlist.prepare(
    'INSERT OR REPLACE INTO booking_confirmations (session_id, email, confirmed_at) VALUES (?, ?, ?)'
  ).bind(session_id, email, now).run();

  return jsonResponse({ success: true, confirmed_at: now });
}

// ── Variable substitution ─────────────────────────────────────────────────────

function subVarsText(text, vars) {
  return text
    .replace(/\{\{participant\}\}/g, vars.participant)
    .replace(/\{\{booker\}\}/g, vars.booker)
    .replace(/\{\{session_dates\}\}/g, vars.session_dates)
    .replace(/\{\{session_time\}\}/g, vars.session_time);
}

function subVarsHtml(html, vars) {
  return html
    .replace(/\{\{participant\}\}/g, esc(vars.participant))
    .replace(/\{\{booker\}\}/g, esc(vars.booker))
    .replace(/\{\{session_dates\}\}/g, esc(vars.session_dates))
    .replace(/\{\{session_time\}\}/g, esc(vars.session_time));
}

// ── Branded email wrapper ─────────────────────────────────────────────────────

function wrapEmail(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0f0f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f0f2;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#0A1628;border-radius:8px 8px 0 0;padding:24px 40px;border-bottom:3px solid #C9A84C;">
          <img src="https://bunyaan.org.uk/assets/logo-nav.png" alt="Bunyaan" height="46" style="display:block;height:46px;width:auto;border:0;">
          <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-top:8px;">Summer Robotics Bootcamp 2026</div>
        </td>
      </tr>
      <tr>
        <td style="background:#111F3A;padding:36px 40px;">${bodyHtml}</td>
      </tr>
      <tr>
        <td style="background:#0A1628;border-radius:0 0 8px 8px;padding:18px 40px;border-top:1px solid rgba(201,168,76,0.12);">
          <p style="color:rgba(255,255,255,0.28);font-size:11px;margin:0;line-height:1.6;">
            Bunyaan SCIO &middot; Registered Scottish Charity SC055377 &middot; Edinburgh, Scotland<br>
            <a href="https://bunyaan.org.uk" style="color:rgba(201,168,76,0.5);text-decoration:none;">bunyaan.org.uk</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Session label resolver ────────────────────────────────────────────────────

function resolveSessionDetails(label) {
  if (label && label.includes('11') && label.includes('12')) {
    return { dates: 'Saturday & Sunday (11 & 12 July 2026)', time: '13:00 – 19:00 each day' };
  }
  if (label && label.includes('18') && label.includes('19')) {
    return { dates: 'Saturday & Sunday (18 & 19 July 2026)', time: '13:00 – 19:00 each day' };
  }
  return { dates: label || 'TBC', time: '13:00 – 19:00 each day' };
}

// ── Legacy email builder (no template_id) ─────────────────────────────────────

function buildLegacyEmail({ booker, participant, sessionDetails }) {
  const name     = esc(participant || booker || 'your child');
  const greeting = esc(booker || 'Parent/Guardian');
  return wrapEmail(`
<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;"><tr><td style="background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.3);border-radius:6px;padding:10px 18px;"><span style="color:#C9A84C;font-size:13px;font-weight:600;letter-spacing:0.06em;">&#10003; BOOKING CONFIRMED</span></td></tr></table>
<p style="color:rgba(255,255,255,0.9);font-size:16px;line-height:1.6;margin:0 0 14px;">Assalamu alaikum <strong style="color:#ffffff;">${greeting}</strong>,</p>
<p style="color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;margin:0 0 28px;">Thank you for booking <strong style="color:#ffffff;">${name}</strong>'s place on the Bunyaan Summer Robotics Bootcamp. Your booking is confirmed.</p>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr><td style="background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.18);border-radius:6px;padding:22px 24px;"><div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A84C;font-weight:600;margin-bottom:14px;">Session Details</div><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:5px 0;width:72px;vertical-align:top;">Dates</td><td style="color:#ffffff;font-size:14px;font-weight:500;padding:5px 0;">${esc(sessionDetails.dates)}</td></tr><tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:5px 0;vertical-align:top;">Time</td><td style="color:#ffffff;font-size:14px;font-weight:500;padding:5px 0;">${esc(sessionDetails.time)}</td></tr><tr><td style="color:rgba(255,255,255,0.45);font-size:13px;padding:5px 0;vertical-align:top;">Venue</td><td style="color:#ffffff;font-size:14px;font-weight:500;padding:5px 0;">Exhibition Hall<br><span style="color:rgba(255,255,255,0.6);font-weight:400;">Edinburgh Central Mosque</span></td></tr></table></td></tr></table>
<p style="color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#ffffff;">Everything is provided:</strong> robots, laptops, materials, and snacks. ${name} just needs comfortable clothing.</p>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr><td style="border-left:3px solid #C9A84C;padding:14px 18px;background:rgba(255,255,255,0.03);"><div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C9A84C;font-weight:600;margin-bottom:8px;">Drop-off &amp; Collection</div><p style="color:rgba(255,255,255,0.72);font-size:14px;line-height:1.65;margin:0;">Please arrive by <strong style="color:#ffffff;">12:45</strong>. Collection is at <strong style="color:#ffffff;">19:00</strong>. Only the parent/guardian who booked, or someone you tell us about in advance, will be able to collect your child.</p></td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;"><tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:20px 24px;"><div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45);font-weight:600;margin-bottom:10px;">Action required</div><p style="color:rgba(255,255,255,0.85);font-size:15px;font-weight:600;margin:0 0 8px;">Please complete the health &amp; allergy form</p><p style="color:rgba(255,255,255,0.55);font-size:13px;line-height:1.6;margin:0 0 16px;">So we can keep ${name} safe, please share any allergies, dietary needs, or medical information we should know about.</p><table cellpadding="0" cellspacing="0" role="presentation"><tr><td style="background:#C9A84C;border-radius:6px;"><a href="https://forms.cloud.microsoft/e/cZZ0rhk6Q5" style="display:inline-block;padding:11px 20px;color:#0A1628;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">Complete Health Form &#8594;</a></td></tr></table></td></tr></table>
<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:32px;"><tr><td style="background:#25D366;border-radius:6px;"><a href="https://chat.whatsapp.com/D29MBVuY3rD1Suo3pkWG1t?s=cl&amp;p=i&amp;ilr=1" style="display:inline-block;padding:12px 22px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">&#128241; Join the Parents WhatsApp Group</a></td></tr></table>
<p style="color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;margin:0 0 6px;">Looking forward to welcoming <strong style="color:#ffffff;">${name}</strong>!</p>
<p style="color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;margin:0 0 28px;">If anything comes up before then, reach us at <a href="mailto:bootcamp@bunyaan.org.uk" style="color:#C9A84C;text-decoration:none;">bootcamp@bunyaan.org.uk</a> or WhatsApp <a href="https://wa.me/447716772296" style="color:#C9A84C;text-decoration:none;">+44 7716 772296</a>.</p>
<p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin:0;font-style:italic;">Jazakum Allahu khayran,<br><strong style="color:rgba(255,255,255,0.72);font-style:normal;">Bunyaan Team</strong></p>`);
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
