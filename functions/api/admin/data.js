const VALID_TYPES = ['join', 'mentor', 'sponsor', 'waitlist', 'counts'];

export async function onRequest(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const db  = context.env.bunyaan_waitlist;
  const url = new URL(context.request.url);

  if (context.request.method === 'GET') {
    const type = url.searchParams.get('type');
    if (!VALID_TYPES.includes(type)) return jsonResponse({ error: 'Invalid type' }, 400);

    try {
      if (type === 'counts') {
        const [join, mentor, sponsor, waitlist] = await Promise.all([
          db.prepare("SELECT COUNT(*) AS n FROM contact_submissions WHERE form_type='join'").first(),
          db.prepare("SELECT COUNT(*) AS n FROM contact_submissions WHERE form_type='mentor'").first(),
          db.prepare("SELECT COUNT(*) AS n FROM contact_submissions WHERE form_type='sponsor'").first(),
          db.prepare("SELECT COUNT(*) AS n FROM waitlist").first(),
        ]);
        return jsonResponse({ join: join.n, mentor: mentor.n, sponsor: sponsor.n, waitlist: waitlist.n });
      }

      if (type === 'waitlist') {
        const result = await db.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
        return jsonResponse({ rows: result.results });
      }

      const result = await db.prepare(
        'SELECT * FROM contact_submissions WHERE form_type = ? ORDER BY created_at DESC'
      ).bind(type).all();
      return jsonResponse({ rows: result.results });

    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  if (context.request.method === 'PATCH') {
    try {
      const { id, table, status, notes } = await context.request.json();
      if (!id || !table) return jsonResponse({ error: 'Missing id or table' }, 400);

      const tbl = table === 'waitlist' ? 'waitlist' : 'contact_submissions';
      await db.prepare(
        `UPDATE ${tbl} SET status = ?, notes = ? WHERE id = ?`
      ).bind(status || 'new', notes || null, id).run();

      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
