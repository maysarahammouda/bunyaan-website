export async function onRequest(context) {
  const token = (context.request.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token || token !== context.env.ADMIN_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const db     = context.env.bunyaan_waitlist;
  const method = context.request.method;

  if (method === 'GET') {
    try {
      const result = await db.prepare(
        'SELECT id, name, subject, body, created_at, updated_at FROM email_templates ORDER BY created_at ASC'
      ).all();
      return jsonResponse({ templates: result.results });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  if (method === 'POST') {
    try {
      const { name, subject, body } = await context.request.json();
      if (!name || !subject || !body) return jsonResponse({ error: 'Missing name, subject, or body' }, 400);
      const now = new Date().toISOString();
      const result = await db.prepare(
        'INSERT INTO email_templates (name, subject, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(name, subject, body, now, now).run();
      return jsonResponse({ success: true, id: result.meta.last_row_id });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  if (method === 'PATCH') {
    try {
      const { id, name, subject, body } = await context.request.json();
      if (!id) return jsonResponse({ error: 'Missing id' }, 400);
      const now = new Date().toISOString();
      await db.prepare(
        'UPDATE email_templates SET name = ?, subject = ?, body = ?, updated_at = ? WHERE id = ?'
      ).bind(name, subject, body, now, Number(id)).run();
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = await context.request.json();
      if (!id) return jsonResponse({ error: 'Missing id' }, 400);
      await db.prepare('DELETE FROM email_templates WHERE id = ?').bind(Number(id)).run();
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
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
