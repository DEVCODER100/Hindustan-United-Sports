// POST /api/enroll  { name, phone, whatsapp, position }
// Inserts a new player and returns { id, completed_days, start_date }.
import { sql, readJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const body = await readJson(req);
    const name = (body.name || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const whatsapp = (body.whatsapp || '').toString().trim();
    const position = (body.position || '').toString().trim() || null;

    if (!name || !phone || !whatsapp) {
      res.status(400).json({ error: 'Name, phone and WhatsApp are required.' });
      return;
    }
    // Basic phone sanity check (7–15 digits, allows +, spaces, dashes).
    const ok = (v) => /^[+\d][\d\s-]{6,18}$/.test(v);
    if (!ok(phone) || !ok(whatsapp)) {
      res.status(400).json({ error: 'Please enter valid phone numbers.' });
      return;
    }

    const rows = await sql`
      INSERT INTO players (name, phone, whatsapp, position)
      VALUES (${name}, ${phone}, ${whatsapp}, ${position})
      RETURNING id, completed_days, start_date
    `;
    const p = rows[0];
    res.status(200).json({
      id: String(p.id),
      completed_days: p.completed_days || [],
      start_date: p.start_date,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not enroll. Please try again.' });
  }
}
