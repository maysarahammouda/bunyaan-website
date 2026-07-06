const VALID_TYPES = ['join', 'mentor', 'sponsor'];

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { form_type, name, email, whatsapp, age, source, questions,
            background, expertise, availability, level, message } = body;

    if (!VALID_TYPES.includes(form_type)) {
      return jsonResponse({ error: 'Invalid form type.' }, 400);
    }
    if (!name?.trim() || !email?.trim()) {
      return jsonResponse({ error: 'Name and email are required.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return jsonResponse({ error: 'Invalid email address.' }, 400);
    }

    await context.env.bunyaan_waitlist.prepare(`
      INSERT INTO contact_submissions
        (form_type, name, email, whatsapp, child_age, source, questions, background, expertise, availability, level, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      form_type,
      name.trim(),
      email.trim().toLowerCase(),
      whatsapp?.trim() || null,
      age?.toString().trim() || null,
      source?.trim() || null,
      questions?.trim() || null,
      background?.trim() || null,
      expertise?.trim() || null,
      availability?.trim() || null,
      level?.trim() || null,
      message?.trim() || null,
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
