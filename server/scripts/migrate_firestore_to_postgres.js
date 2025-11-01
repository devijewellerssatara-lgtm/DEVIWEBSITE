/*
  One-off migration script: Firestore (rates doc) -> Postgres (rates table)

  Requirements:
  - npm i firebase-admin pg dotenv
  - Provide GOOGLE_APPLICATION_CREDENTIALS pointing to your Firebase Admin SDK service account JSON
  - Configure Postgres connection via DATABASE_URL or PG* env vars (see ../.env.example)
  - node scripts/migrate_firestore_to_postgres.js
*/

import 'dotenv/config';
import admin from 'firebase-admin';
import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

async function main() {
  // Ensure service account is available
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath || !fs.existsSync(saPath)) {
    console.error('Missing GOOGLE_APPLICATION_CREDENTIALS or file not found:', saPath);
    process.exit(1);
  }

  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  const firestore = admin.firestore();

  // Connect to Postgres
  const connectionString = process.env.DATABASE_URL || [
    'postgres://',
    process.env.PGUSER || 'postgres', ':',
    process.env.PGPASSWORD || '',
    '@',
    process.env.PGHOST || 'localhost', ':',
    process.env.PGPORT || '5432', '/',
    process.env.PGDATABASE || 'jewellery'
  ].join('');

  const pool = new Pool({
    connectionString,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
  });

  const client = await pool.connect();
  try {
    // Ensure table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rates (
        id TEXT PRIMARY KEY,
        vedhani NUMERIC,
        ornaments22k NUMERIC,
        ornaments18k NUMERIC,
        silver NUMERIC,
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    const id = process.env.RATES_ID || 'GF8lmn4pjyeuqPzA0xDE';

    // Read from Firestore
    const docRef = firestore.collection('rates').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      console.error('Firestore document not found for rates id:', id);
      process.exit(2);
    }
    const data = snap.data();

    // Map fields
    const vedhani = data.vedhani ?? null;
    const ornaments22k = data.ornaments22K ?? data.ornaments22k ?? null;
    const ornaments18k = data.ornaments18K ?? data.ornaments18k ?? null;
    const silver = data.silver ?? null;

    // Upsert into Postgres
    await client.query(
      `INSERT INTO rates (id, vedhani, ornaments22k, ornaments18k, silver)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         vedhani = EXCLUDED.vedhani,
         ornaments22k = EXCLUDED.ornaments22k,
         ornaments18k = EXCLUDED.ornaments18k,
         silver = EXCLUDED.silver,
         updated_at = now()`,
      [id, vedhani, ornaments22k, ornaments18k, silver]
    );

    console.log('Migration complete for rates id:', id);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});