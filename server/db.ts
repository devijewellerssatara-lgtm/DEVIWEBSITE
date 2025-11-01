import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  [
    'postgres://',
    process.env.PGUSER || 'postgres',
    ':',
    process.env.PGPASSWORD || '',
    '@',
    process.env.PGHOST || 'localhost',
    ':',
    process.env.PGPORT || '5432',
    '/',
    process.env.PGDATABASE || 'jewellery',
  ].join('');

export const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}