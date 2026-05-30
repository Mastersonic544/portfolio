<script>
  import { onMount } from 'svelte';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  /** @type {{ label: string; url: string }[]} */
  let cvs     = $state([]);
  let loading = $state(true);
  let saving  = $state(false);
  let saved   = $state(false);

  let newLabel = $state('');
  let newUrl   = $state('');

  const docRef = doc(db, 'settings', 'cvs');

  onMount(async () => {
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) cvs = snap.data().list ?? [];
    } catch { /* silent */ }
    loading = false;
  });

  async function persist() {
    saving = true;
    saved  = false;
    try {
      await setDoc(docRef, { list: cvs });
      saved = true;
      setTimeout(() => (saved = false), 2000);
    } finally {
      saving = false;
    }
  }

  function addCv() {
    const label = newLabel.trim();
    const url   = newUrl.trim();
    if (!label || !url) return;
    cvs = [...cvs, { label, url }];
    newLabel = '';
    newUrl   = '';
    persist();
  }

  /** @param {number} i */
  function removeCv(i) {
    cvs = cvs.filter((_, j) => j !== i);
    persist();
  }
</script>

<svelte:head>
  <title>CVs — Shift Admin</title>
</svelte:head>

<div class="page">
  <div class="page-header">
    <h1 class="page-title">CV Downloads</h1>
    {#if saved}<span class="saved-badge">Saved ✓</span>{/if}
  </div>

  <p class="desc">
    Add CV versions here. Each entry appears in the download popup on the public site.
    Use direct download links (Google Drive, Dropbox, etc. — make sure link is publicly accessible).
  </p>

  {#if loading}
    <p class="hint">Loading…</p>
  {:else}
    <div class="cv-list">
      {#each cvs as cv, i}
        <div class="cv-row">
          <input
            class="cv-label-input"
            type="text"
            placeholder="Label (e.g. General CV — English)"
            value={cv.label}
            onblur={(e) => { cvs[i] = { ...cv, label: e.currentTarget.value }; persist(); }}
          />
          <input
            class="cv-url-input"
            type="url"
            placeholder="Download URL"
            value={cv.url}
            onblur={(e) => { cvs[i] = { ...cv, url: e.currentTarget.value }; persist(); }}
          />
          <button class="del-btn" onclick={() => removeCv(i)} aria-label="Remove">×</button>
        </div>
      {/each}
    </div>

    <div class="add-row">
      <input
        class="cv-label-input"
        type="text"
        placeholder="Label (e.g. Tech CV — French)"
        bind:value={newLabel}
      />
      <input
        class="cv-url-input"
        type="url"
        placeholder="Download URL"
        bind:value={newUrl}
      />
      <button
        class="add-btn"
        onclick={addCv}
        disabled={!newLabel.trim() || !newUrl.trim() || saving}
      >+ Add</button>
    </div>
  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.5rem; max-width: 720px; }

  .page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .saved-badge {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: #38a169;
    font-weight: 600;
  }

  .desc {
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--text-muted);
    margin: 0;
  }

  .cv-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .cv-row, .add-row {
    display: grid;
    grid-template-columns: 1fr 1.6fr auto;
    gap: 0.625rem;
    align-items: center;
  }

  .cv-label-input, .cv-url-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.35rem 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
  }
  .cv-label-input:focus, .cv-url-input:focus { border-bottom-color: var(--accent); }

  .del-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: pointer;
    transition: color 0.15s ease;
    padding: 0;
    line-height: 1;
    justify-self: end;
  }
  .del-btn:hover { color: #e53e3e; }

  .add-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.4rem 0.875rem;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }
  .add-btn:hover:not(:disabled) { opacity: 0.88; }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .cv-row, .add-row { grid-template-columns: 1fr auto; grid-template-rows: auto auto; }
    .cv-url-input { grid-column: 1; }
    .del-btn, .add-btn { grid-row: 1; grid-column: 2; }
  }
</style>
