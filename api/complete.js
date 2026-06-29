// POST /api/complete  { id, day }
// Marks a day (1..28) complete for a player. Idempotent — no duplicates.
// Returns { completed_days }.
import { sql, readJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const body = await readJson(req);
    const id = (body.id ?? '').toString().trim();
    const day = parseInt(body.day, 10);

    if (!/^\d+$/.test(id)) {
      res.status(400).json({ error: 'Invalid id.' });
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      res.status(400).json({ error: 'Invalid day.' });
      return;
    }

    // Append only if not already present (keeps the array unique + sorted).
    const rows = await sql`
      UPDATE players
      SET completed_days = (
        SELECT ARRAY(
          SELECT DISTINCT unnest(completed_days || ARRAY[${day}]::int[]) ORDER BY 1
        )
      )
      WHERE id = ${id}
      RETURNING completed_days
    `;
    if (rows.length === 0) {
      res.status(404).json({ error: 'Player not found.' });
      return;
    }
    res.status(200).json({ completed_days: rows[0].completed_days || [] });
  } catch (e) {
    res.status(500).json({ error: 'Could not save progress.' });
  }
}
