// GET /api/get-report?id=123
// Returns a saved player report so it can be re-opened with its exact customization.
import { sql } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const id = (req.query?.id || '').toString().trim();
    if (!/^\d+$/.test(id)) { res.status(400).json({ error: 'Invalid id.' }); return; }

    const rows = await sql`
      SELECT player_name, age_group, position,
             to_char(test_date, 'YYYY-MM-DD') AS test_date, ground,
             sprint10, sprint30, illinois, ttest, slalom, fig8, wallpass, target, yoyo,
             pace, agility, dribbling, passing, stamina, ovr, band
      FROM player_reports WHERE id = ${id}
    `;
    if (rows.length === 0) { res.status(404).json({ error: 'Report not found.' }); return; }

    const r = rows[0];
    res.status(200).json({
      player_name: r.player_name,
      age_group: r.age_group,
      position: r.position,
      test_date: r.test_date,
      ground: r.ground,
      raw: {
        sprint10: r.sprint10, sprint30: r.sprint30, illinois: r.illinois, ttest: r.ttest,
        slalom: r.slalom, fig8: r.fig8, wallpass: r.wallpass, target: r.target, yoyo: r.yoyo,
      },
      scores: {
        pace: r.pace, agility: r.agility, dribbling: r.dribbling,
        passing: r.passing, stamina: r.stamina, ovr: r.ovr, band: r.band,
      },
    });
  } catch (e) {
    res.status(500).json({ error: 'Could not load report.' });
  }
}
