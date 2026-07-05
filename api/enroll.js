// POST /api/enroll  { name, phone, dob, city }
// Inserts a new player and returns { id, completed_days, last_completed_at }.
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
    const dob = (body.dob || '').toString().trim();
    const city = (body.city || '').toString().trim();

    if (!name || !phone || !dob || !city) {
      res.status(400).json({ error: 'Name, phone, date of birth and city are all required.' });
      return;
    }
    if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) {
      res.status(400).json({ error: 'Please enter a valid phone number.' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      res.status(400).json({ error: 'Please enter a valid date of birth.' });
      return;
    }

    const rows = await sql`
      INSERT INTO players (name, phone, dob, city)
      VALUES (${name}, ${phone}, ${dob}, ${city})
      RETURNING id, completed_days, last_completed_at
    `;
    const p = rows[0];
    res.status(200).json({
      id: String(p.id),
      completed_days: p.completed_days || [],
      last_completed_at: p.last_completed_at,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not enroll. Please try again.' });
  }
}
