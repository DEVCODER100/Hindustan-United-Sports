// GET /api/progress?id=123
// Returns { name, position, completed_days, start_date } for a player.
import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const id = (req.query?.id || '').toString().trim();
    if (!/^\d+$/.test(id)) {
      res.status(400).json({ error: 'Invalid id.' });
      return;
    }
    const rows = await sql`
      SELECT name, position, completed_days, start_date
      FROM players WHERE id = ${id}
    `;
    if (rows.length === 0) {
      res.status(404).json({ error: 'Player not found.' });
      return;
    }
    const p = rows[0];
    res.status(200).json({
      name: p.name,
      position: p.position,
      completed_days: p.completed_days || [],
      start_date: p.start_date,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not load progress.' });
  }
}
