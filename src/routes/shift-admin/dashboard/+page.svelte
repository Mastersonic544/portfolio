<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  /** @type {{ data: { visits: number | null; uniques: number | null } }} */
  let { data } = $props();

  /** @type {{ section: string; count: number }[]} */
  let heatmap       = $state([]);
  let topSection    = $state('—');
  let heatmapReady  = $state(false);

  let copyState = $state(/** @type {'idle' | 'working' | 'done'} */ ('idle'));

  onMount(async () => {
    try {
      const snap = await getDocs(collection(db, 'analytics'));
      /** @type {Record<string, number>} */
      const counts = {};
      snap.forEach((doc) => {
        const s = doc.data().section;
        if (s) counts[s] = (counts[s] ?? 0) + 1;
      });
      heatmap = Object.entries(counts)
        .map(([section, count]) => ({ section, count }))
        .sort((a, b) => b.count - a.count);
      topSection = heatmap[0]?.section ?? '—';
    } finally {
      heatmapReady = true;
    }
  });

  async function copySiteJSON() {
    if (copyState !== 'idle') return;
    copyState = 'working';
    try {
      const [projSnap, sectSnap] = await Promise.all([
        getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'sections'),  orderBy('order')))
      ]);
      const payload = {
        projects: projSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        sections: sectSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      copyState = 'done';
      setTimeout(() => (copyState = 'idle'), 2000);
    } catch {
      copyState = 'idle';
    }
  }
</script>

<svelte:head>
  <title>Dashboard — Shift Admin</title>
</svelte:head>

<div class="dashboard">

  <div class="page-header">
    <h1 class="page-title">Dashboard</h1>
    <button class="copy-btn" onclick={copySiteJSON} disabled={copyState === 'working'}>
      {copyState === 'done' ? 'Copied!' : copyState === 'working' ? 'Fetching…' : 'Copy Site JSON'}
    </button>
  </div>

  <!-- KPI cards -->
  <div class="kpi-row">
    <div class="kpi-card">
      <span class="kpi-label">Total Visits</span>
      <span class="kpi-value">{data.visits ?? '—'}</span>
      <span class="kpi-sub">Last 30 days · Vercel Analytics</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Unique Visitors</span>
      <span class="kpi-value">{data.uniques ?? '—'}</span>
      <span class="kpi-sub">Last 30 days · Vercel Analytics</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Top Section</span>
      <span class="kpi-value kpi-text">{topSection}</span>
      <span class="kpi-sub">Most clicked · Firestore</span>
    </div>
  </div>

  <!-- Section heatmap -->
  <div class="heatmap">
    <h2 class="block-title">Section Heatmap</h2>

    {#if !heatmapReady}
      <p class="hint">Loading…</p>
    {:else if heatmap.length === 0}
      <p class="hint">No click events recorded yet.</p>
    {:else}
      <div class="heatmap-list">
        {#each heatmap as row}
          {@const pct = Math.round((row.count / heatmap[0].count) * 100)}
          <div class="hm-row">
            <span class="hm-name">{row.section}</span>
            <div class="hm-track">
              <div class="hm-fill" style="width: {pct}%"></div>
            </div>
            <span class="hm-count">{row.count}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

</div>

<style>
  .dashboard { display: flex; flex-direction: column; gap: 2.5rem; }

  /* ── Header row ─────────────────────────────── */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .copy-btn {
    background: var(--bg-card);
    border: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.5rem 1.125rem;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .copy-btn:hover:not(:disabled) { background: var(--text-muted); color: var(--bg); }
  .copy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── KPI row ────────────────────────────────── */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .kpi-card {
    background: var(--bg-card);
    padding: 1.5rem 1.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .kpi-label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
  }

  .kpi-value {
    font-family: var(--font-heading);
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: var(--text);
    line-height: 1;
  }

  .kpi-value.kpi-text {
    font-size: 1.1rem;
    text-transform: capitalize;
    letter-spacing: -0.02em;
  }

  .kpi-sub {
    font-family: var(--font-body);
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 0.375rem;
  }

  /* ── Heatmap ────────────────────────────────── */
  .heatmap { display: flex; flex-direction: column; gap: 1rem; }

  .block-title {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .heatmap-list { display: flex; flex-direction: column; gap: 0.625rem; }

  .hm-row {
    display: grid;
    grid-template-columns: 130px 1fr 44px;
    align-items: center;
    gap: 1rem;
  }

  .hm-name {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text);
    text-transform: capitalize;
  }

  .hm-track {
    height: 5px;
    background: var(--bg-card);
    border-radius: 3px;
    overflow: hidden;
  }

  .hm-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    min-width: 4px;
    transition: width 0.45s ease;
  }

  .hm-count {
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    text-align: right;
  }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  @media (max-width: 768px) {
    .kpi-row { grid-template-columns: 1fr; }
  }
</style>
