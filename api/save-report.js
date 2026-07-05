// POST /api/save-report  { player_name, age_group, position, test_date, ground, raw:{...}, scores:{...} }
// Saves a player test report and returns { id }.
import { sql, readJson } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const b = await readJson(req);
    const name = (b.player_name || '').toString().trim();
    if (!name) { res.status(400).json({ error: 'Player name is required.' }); return; }

    const raw = b.raw || {};
    const s = b.scores || {};
    const rows = await sql`
      INSERT INTO player_reports
        (player_name, age_group, position, test_date, ground,
         sprint10, sprint30, illinois, ttest, slalom, fig8, wallpass, target, yoyo,
         pace, agility, dribbling, passing, stamina, ovr, band)
      VALUES
        (${name}, ${b.age_group || null}, ${b.position || null}, ${b.test_date || null}, ${b.ground || null},
         ${raw.sprint10 ?? null}, ${raw.sprint30 ?? null}, ${raw.illinois ?? null}, ${raw.ttest ?? null},
         ${raw.slalom ?? null}, ${raw.fig8 ?? null}, ${raw.wallpass ?? null}, ${raw.target ?? null}, ${raw.yoyo ?? null},
         ${s.pace ?? null}, ${s.agility ?? null}, ${s.dribbling ?? null}, ${s.passing ?? null}, ${s.stamina ?? null},
         ${s.ovr ?? null}, ${s.band || null})
      RETURNING id
    `;
    res.status(200).json({ id: String(rows[0].id) });
  } catch (e) {
    res.status(500).json({ error: 'Could not save report. Please try again.' });
  }
}
