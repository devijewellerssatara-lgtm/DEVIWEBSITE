import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Ensure table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      vedhani NUMERIC,
      ornaments22k NUMERIC,
      ornaments18k NUMERIC,
      silver NUMERIC,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  // Seed a default row with the known Firestore ID if it doesn't exist
  const id = process.env.RATES_ID || 'GF8lmn4pjyeuqPzA0xDE';
  await query(
    `INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
     VALUES ($1, NULL, NULL, NULL, NULL)
     ON CONFLICT (id) DO NOTHING`,
    [id]
  );
}

ensureTable().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed creating/ensuring rates table', e);
});

router.get('/', async (_req, res) => {
  try {
    const id = process.env.RATES_ID || 'GF8lmn4pjyeuqPzA0xDE';
    const { rows } = await query(
      'SELECT id, vedhani, ornaments22k, ornaments18k, silver, updated_at FROM rates WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Rates not found' });
    return res.json(rows[0]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const id = process.env.RATES_ID || 'GF8lmn4pjyeuqPzA0xDE';
    const { vedhani, ornaments22K, ornaments18K, silver } = req.body as Record<string, any>;

    // Accept both camel variants from the React form
    const o22 = ornaments22K ?? req.body.ornaments22k;
    const o18 = ornaments18K ?? req.body.ornaments18k;

    const { rows } = await query(
      `UPDATE rates
       SET vedhani = $2, ornaments22k = $3, ornaments18k = $4, silver = $5, updated_at = now()
       WHERE id = $1
       RETURNING id, vedhani, ornaments22k, ornaments18k, silver, updated_at`,
      [id, vedhani, o22, o18, silver]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Rates not found' });
    return res.json(rows[0]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;