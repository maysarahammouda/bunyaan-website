export async function onRequestGet(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  try {
    const result = await context.env.bunyaan_waitlist.prepare(
      'SELECT session_id, confirmed_at FROM booking_confirmations'
    ).all();
    return jsonResponse({ rows: result.results });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
