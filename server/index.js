import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
});

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rates (
      id INTEGER PRIMARY KEY DEFAULT 1,
      vedhani NUMERIC,
      ornaments22k NUMERIC,
      ornaments18k NUMERIC,
      silver NUMERIC,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
    VALUES (1, NULL, NULL, NULL, NULL)
    ON CONFLICT (id) DO NOTHING;
  `);
}

ensureTable().catch(err => {
  console.error('Error ensuring table exists:', err);
  process.exit(1);
});

// Routes
app.get('/api/rates', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT vedhani, ornaments22k, ornaments18k, silver, updated_at FROM rates WHERE id = 1');
    if (!rows.length) {
      return res.status(404).json({ message: 'Rates not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/rates error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/rates', async (req, res) => {
  const { vedhani, ornaments22K, ornaments18K, silver } = req.body;

  // Accept both ornaments22K and ornaments22k keys to be lenient
  const payload = {
    vedhani: vedhani ?? null,
    ornaments22k: (ornaments22K ?? req.body.ornaments22k) ?? null,
    ornaments18k: (ornaments18K ?? req.body.ornaments18k) ?? null,
    silver: silver ?? null,
  };

  try {
    const { rows } = await pool.query(
      `UPDATE rates
       SET vedhani = $1,
           ornaments22k = $2,
           ornaments18k = $3,
           silver = $4,
           updated_at = NOW()
       WHERE id = 1
       RETURNING vedhani, ornaments22k, ornaments18k, silver, updated_at`,
      [payload.vedhani, payload.ornaments22k, payload.ornaments18k, payload.silver]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/rates error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Rates API listening on port ${port}`);
});