import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
import { readFile, access } from 'fs/promises';

const CLOUD_NAME = 'dqj3hs43d';
const PRESET     = 'ciaplqon';

const firebaseConfig = {
  apiKey: 'AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk',
  authDomain: 'shift-portfolio.firebaseapp.com',
  projectId: 'shift-portfolio',
  storageBucket: 'shift-portfolio.firebasestorage.app',
  messagingSenderId: '187108220290',
  appId: '1:187108220290:web:fd3556e756b0cc855e839b',
};

const app = initializeApp(firebaseConfig);
const db  = initializeFirestore(app, { localCache: memoryLocalCache() });

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function uploadToCloudinary(buffer, folder, filename) {
  const publicId = `shift/${folder}/${filename.replace(/\.webp$/, '')}`;
  const blob = new Blob([buffer], { type: 'image/webp' });

  const form = new FormData();
  form.append('file', blob, filename);
  form.append('upload_preset', PRESET);
  form.append('public_id', publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) throw new Error(`Cloudinary ${res.status}: ${await res.text()}`);
  return (await res.json()).secure_url;
}

async function main() {
  // ── Highlights ──────────────────────────────────────────────────────────────
  console.log('\n── Highlights ──');
  const hSnap = await getDocs(
    query(collection(db, 'sections'), where('name', '==', 'highlights'), limit(1))
  );

  if (!hSnap.empty) {
    const hDoc  = hSnap.docs[0];
    const items = hDoc.data().items ?? [];
    const updated = items.map(i => ({ ...i }));
    let changed = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.slug || item.url) { console.log(`  skip  ${item.slug ?? '(no slug)'}`); continue; }

      const path = `static/images/highlights/${item.slug}.webp`;
      if (!(await exists(path))) { console.log(`  miss  ${path}`); continue; }

      try {
        process.stdout.write(`  upload ${item.slug}… `);
        const url = await uploadToCloudinary(await readFile(path), 'highlights', `${item.slug}.webp`);
        updated[i] = { ...item, url };
        changed = true;
        console.log(`✓`);
        console.log(`         ${url}`);
      } catch (e) {
        console.log(`✗ ${e.message}`);
      }
    }

    if (changed) {
      await updateDoc(doc(db, 'sections', hDoc.id), { items: updated });
      console.log('  Firestore updated.');
    }
  } else {
    console.log('  No highlights section found in Firestore.');
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  console.log('\n── Projects ──');
  const pSnap = await getDocs(collection(db, 'projects'));

  for (const pDoc of pSnap.docs) {
    const d = pDoc.data();
    if (!d.slug || d.thumbUrl) { console.log(`  skip  ${d.slug ?? pDoc.id}`); continue; }

    const filename = `${d.slug}-thumb.webp`;
    const path = `static/images/projects/${filename}`;
    if (!(await exists(path))) { console.log(`  miss  ${path}`); continue; }

    try {
      process.stdout.write(`  upload ${d.slug}… `);
      const url = await uploadToCloudinary(await readFile(path), 'projects', filename);
      await updateDoc(doc(db, 'projects', pDoc.id), { thumbUrl: url });
      console.log(`✓`);
      console.log(`         ${url}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  console.log('\n── Done. ──\n');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
