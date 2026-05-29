<script>
  import { collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { uploadToStorage } from '$lib/utils/uploadToStorage.js';

  let status  = $state('idle'); // idle | running | done | error
  /** @type {string[]} */
  let logs    = $state([]);
  let total   = $state(0);
  let done    = $state(0);

  function log(msg) { logs = [...logs, msg]; }

  async function migrate() {
    status = 'running';
    logs   = [];
    total  = 0;
    done   = 0;

    try {
      // ── Highlights ────────────────────────────────
      log('── Scanning highlights…');
      const hSnap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'highlights'), limit(1))
      );

      if (!hSnap.empty) {
        const hDoc  = hSnap.docs[0];
        const items = /** @type {any[]} */ (hDoc.data().items ?? []);
        const needsMigration = items.filter(i => i.slug && !i.url);
        total += needsMigration.length;

        const updatedItems = items.map(i => ({ ...i }));

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.slug || item.url) continue;

          log(`  Fetching /images/highlights/${item.slug}.webp…`);
          try {
            const res = await fetch(`/images/highlights/${item.slug}.webp`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const url  = await uploadToStorage(blob, 'highlights', `${item.slug}.webp`);
            updatedItems[i] = { ...item, url };
            log(`  ✓ ${item.slug}`);
          } catch (e) {
            log(`  ✗ ${item.slug}: ${/** @type {any} */ (e).message}`);
          }
          done++;
        }

        await updateDoc(doc(db, 'sections', hDoc.id), { items: updatedItems });
        log('  Highlights Firestore updated.');
      } else {
        log('  No highlights section found.');
      }

      // ── Projects ──────────────────────────────────
      log('── Scanning projects…');
      const pSnap = await getDocs(collection(db, 'projects'));
      const toMigrate = pSnap.docs.filter(d => {
        const data = d.data();
        return data.slug && !data.thumbUrl && (data.imageCount ?? 0) > 0;
      });
      total += toMigrate.length;

      for (const pDoc of toMigrate) {
        const d        = pDoc.data();
        const filename = `${d.slug}-thumb.webp`;
        log(`  Fetching /images/projects/${filename}…`);
        try {
          const res = await fetch(`/images/projects/${filename}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const url  = await uploadToStorage(blob, 'projects', filename);
          await updateDoc(doc(db, 'projects', pDoc.id), { thumbUrl: url });
          log(`  ✓ ${d.slug}`);
        } catch (e) {
          log(`  ✗ ${d.slug}: ${/** @type {any} */ (e).message}`);
        }
        done++;
      }

      log(`── Done. ${done}/${total} images processed.`);
      status = 'done';
    } catch (e) {
      log(`Fatal: ${/** @type {any} */ (e).message}`);
      status = 'error';
    }
  }
</script>

<svelte:head>
  <title>Migrate Images — Shift Admin</title>
</svelte:head>

<div class="page">
  <h1 class="title">Migrate Images to Firebase Storage</h1>
  <p class="desc">
    Run this <strong>once, locally</strong> before your first deployment. It fetches every
    existing WebP from <code>/images/</code>, uploads it to Firebase Storage, and saves
    the permanent URL back to Firestore. After this, images work on any host.
  </p>

  {#if status === 'idle'}
    <button class="run-btn" onclick={migrate}>Run Migration</button>
  {:else if status === 'running'}
    <div class="progress-row">
      <span class="spinner">↻</span>
      <span class="progress-text">Migrating… {done}/{total}</span>
    </div>
  {:else if status === 'done'}
    <p class="done-msg">✓ Migration complete — {done}/{total} images uploaded.</p>
    <button class="run-btn secondary" onclick={migrate}>Run Again</button>
  {:else}
    <p class="error-msg">Migration encountered an error — see log below.</p>
    <button class="run-btn" onclick={migrate}>Retry</button>
  {/if}

  {#if logs.length}
    <pre class="log">{logs.join('\n')}</pre>
  {/if}
</div>

<style>
  .page  { display: flex; flex-direction: column; gap: 1.5rem; max-width: 680px; }

  .title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin: 0;
  }

  .desc {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.7;
    color: var(--text-muted);
    margin: 0;
  }

  .desc strong { color: var(--text); }
  .desc code   { color: var(--accent); font-size: 0.82rem; }

  .run-btn {
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.75rem 2rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  .run-btn:hover  { opacity: 0.88; }
  .run-btn.secondary { background: transparent; border: 1px solid var(--text-muted); color: var(--text); }
  .run-btn.secondary:hover { border-color: var(--text); }

  .progress-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .spinner {
    display: inline-block;
    animation: spin 0.8s linear infinite;
    color: var(--accent);
    font-size: 1.1rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .done-msg  { font-family: var(--font-body); font-size: 0.9rem; color: #38a169; margin: 0; }
  .error-msg { font-family: var(--font-body); font-size: 0.9rem; color: #e53e3e; margin: 0; }

  .log {
    background: var(--bg-card);
    border: 1px solid var(--border);
    padding: 1rem 1.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.7;
    color: var(--text-muted);
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
  }
</style>
