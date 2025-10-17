import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { pool, ensureSchema } from '../db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initFirebase() {
  const serviceAccountPath = path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT || 'serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at ${serviceAccountPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
}

async function migrateRates() {
  const firestore = admin.firestore();

  // Adjust these paths as needed based on your Firestore layout
  const docId = 'GF8lmn4pjyeuqPzA0xDE';
  const docRef = firestore.collection('rates').doc(docId);
  const snap = await docRef.get();
  if (!snap.exists) {
    console.log('No Firestore rates document found, skipping.');
    return;
  }
  const data = snap.data();

  await pool.query(
    'INSERT INTO rates (vedhani, ornaments22k, ornaments18k, silver) VALUES ($1,$2,$3,$4)',
    [data.vedhani ?? null, data.ornaments22K ?? null, data.ornaments18K ?? null, data.silver ?? null]
  );

  console.log('Migrated rates data into PostgreSQL.');
}

async function migrateImages() {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: 'images/' });
  if (!files || files.length === 0) {
    console.log('No images found in Firebase Storage.');
    return;
  }

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  for (const file of files) {
    const dest = path.join(uploadsDir, path.basename(file.name));
    console.log(`Downloading ${file.name} -> ${dest}`);
    await file.download({ destination: dest });
  }

  console.log(`Downloaded ${files.length} images to ${uploadsDir}`);
}

async function main() {
  await ensureSchema();
  await initFirebase();
  await migrateRates();
  await migrateImages();
  console.log('Migration complete. You can now stop using Firebase and rely on PostgreSQL/local uploads.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});