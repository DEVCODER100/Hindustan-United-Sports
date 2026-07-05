// POST /api/complete  { id, day }
// Marks a day complete — but only in order and only once the 4-hour cooldown
// since the previous day's completion has passed. Enforced server-side.
// Returns { completed_days, last_completed_at }.
import { sql, readJson } from './_db.js';

const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
const TOTAL_DAYS = 28;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const body = await readJson(req);
    const id = (body.id ?? '').toString().trim();
    const day = parseInt(body.day, 10);

    if (!/^\d+$/.test(id)) { res.status(400).json({ error: 'Invalid id.' }); return; }
    if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
      res.status(400).json({ error: 'Invalid day.' });
      return;
    }

    const rows = await sql`
      SELECT completed_days, last_completed_at FROM players WHERE id = ${id}
    `;
    if (rows.length === 0) { res.status(404).json({ error: 'Player not found.' }); return; }

    const done = (rows[0].completed_days || []).map(Number);
    const lastAt = rows[0].last_completed_at ? new Date(rows[0].last_completed_at) : null;
    const maxDone = done.length ? Math.max(...done) : 0;

    // Already completed → idempotent success.
    if (done.includes(day)) {
      res.status(200).json({ completed_days: done, last_completed_at: rows[0].last_completed_at });
      return;
    }

    // Must complete days strictly in order.
    const nextDay = maxDone + 1;
    if (day !== nextDay) {
      res.status(409).json({ error: `Finish day ${nextDay} first.`, completed_days: done, last_completed_at: rows[0].last_completed_at });
      return;
    }

    // 4-hour cooldown between consecutive days (day 1 has no wait).
    if (lastAt) {
      const remaining = lastAt.getTime() + COOLDOWN_MS - Date.now();
      if (remaining > 0) {
        res.status(429).json({
          error: 'This day is still on cooldown.',
          remaining_ms: remaining,
          completed_days: done,
          last_completed_at: rows[0].last_completed_at,
        });
        return;
      }
    }

    const updated = await sql`
      UPDATE players
      SET completed_days = (
            SELECT ARRAY(SELECT DISTINCT unnest(completed_days || ARRAY[${day}]::int[]) ORDER BY 1)
          ),
          last_completed_at = now()
      WHERE id = ${id}
      RETURNING completed_days, last_completed_at
    `;
    res.status(200).json({
      completed_days: updated[0].completed_days || [],
      last_completed_at: updated[0].last_completed_at,
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not save progress.' });
  }
}
