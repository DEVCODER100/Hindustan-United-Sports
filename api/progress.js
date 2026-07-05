// GET /api/progress?id=123
// Returns { name, completed_days, last_completed_at } for a player.
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
      SELECT name, completed_days, last_completed_at
      FROM players WHERE id = ${id}
    `;
    if (rows.length === 0) {
      res.status(404).json({ error: 'Player not found.' });
      return;
    }
    const p = rows[0];
    res.status(200).json({
      name: p.name,
      completed_days: p.completed_days || [],
      last_completed_at: p.last_completed_at,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not load progress.' });
  }
}
