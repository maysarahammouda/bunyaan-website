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

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
