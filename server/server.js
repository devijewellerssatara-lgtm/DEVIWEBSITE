import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool, ensureSchema } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Static hosting for uploaded images
app.use('/uploads', express.static(uploadsPath));

// Storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});
const upload = multer({ storage });

// Routes

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Rates: GET
app.get('/api/rates', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT vedhani, ornaments22k, ornaments18k, silver FROM rates ORDER BY updated_at DESC, id DESC LIMIT 1'
    );
    if (rows.length === 0) return res.json({ vedhani: null, ornaments22K: null, ornaments18K: null, silver: null });
    const r = rows[0];
    res.json({
      vedhani: r.vedhani,
      ornaments22K: r.ornaments22k,
      ornaments18K: r.ornaments18k,
      silver: r.silver
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Rates: POST (upsert new snapshot)
app.post('/api/rates', async (req, res) => {
  const { vedhani, ornaments22K, ornaments18K, silver } = req.body || {};
  try {
    const { rows } = await pool.query(
      'INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver) VALUES ($1,$2,$3,$4) RETURNING *',
      [vedhani ?? null, ornaments22K ?? null, ornaments18K ?? null, silver ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to save rates' });
  }
});

// Upload image
app.post('/api/images', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file' });
  const publicUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: publicUrl });
});

// Get latest image
app.get('/api/images/latest', async (_req, res) => {
  try {
    const files = await fs.promises.readdir(uploadsPath);
    const imageFiles = files.filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f));
    if (imageFiles.length === 0) return res.json({ url: null });

    // Sort by timestamp prefix
    const sorted = imageFiles.sort((a, b) => {
      const aTs = parseInt(a.split('_')[0], 10);
      const bTs = parseInt(b.split('_')[0], 10);
      return (isNaN(bTs) ? 0 : bTs) - (isNaN(aTs) ? 0 : aTs);
    });

    res.json({ url: `/uploads/${sorted[0]}` });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read images' });
  }
});

const port = process.env.PORT || 5000;

async function start() {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start();