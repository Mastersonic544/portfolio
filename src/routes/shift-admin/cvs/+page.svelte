<script>
  import { onMount } from 'svelte';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import {
    Code, PaintBrush, Stack, DeviceMobile, ChartBar,
    GraduationCap, Briefcase, FileText
  } from 'phosphor-svelte';

  const ICONS = [
    { id: 'code',      label: 'Dev / Code',   Icon: Code },
    { id: 'design',    label: 'Design',        Icon: PaintBrush },
    { id: 'fullstack', label: 'Full Stack',    Icon: Stack },
    { id: 'mobile',    label: 'Mobile',        Icon: DeviceMobile },
    { id: 'data',      label: 'Data / AI',     Icon: ChartBar },
    { id: 'academic',  label: 'Academic',      Icon: GraduationCap },
    { id: 'business',  label: 'Business',      Icon: Briefcase },
    { id: 'general',   label: 'General',       Icon: FileText },
  ];

  /** @type {Record<string, typeof ICONS[0]>} */
  const ICON_MAP = Object.fromEntries(ICONS.map(ic => [ic.id, ic]));

  /** @type {{ label: string; icon: string; url: string }[]} */
  let cvs        = $state([]);
  let resumeUrl  = $state('');
  let loading    = $state(true);
  let saving     = $state(false);
  let saved      = $state(false);

  let newLabel    = $state('');
  let newIcon     = $state('general');
  /** @type {File | null} */
  let newFile     = $state(null);
  let uploading   = $state(false);
  let uploadError = $state('');

  const docRef = doc(db, 'settings', 'cvs');

  onMount(async () => {
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        cvs       = snap.data().list      ?? [];
        resumeUrl = snap.data().resumeUrl ?? '';
      }
    } catch { /* silent */ }
    loading = false;
  });

  async function persist() {
    saving = true;
    saved  = false;
    try {
      await setDoc(docRef, { list: cvs, resumeUrl });
      saved = true;
      setTimeout(() => (saved = false), 2000);
    } finally {
      saving = false;
    }
  }

  async function addCv() {
    if (!newFile || !newLabel.trim()) return;
    uploading   = true;
    uploadError = '';
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset    = import.meta.env.VITE_CLOUDINARY_PRESET;
      const slug = `${Date.now()}-${newLabel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      const form = new FormData();
      form.append('file', newFile);
      form.append('upload_preset', preset);
      form.append('public_id', `shift/cvs/${slug}`);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: form }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message ?? `Upload failed (${res.status})`);
      }
      const data = await res.json();
      cvs = [...cvs, { label: newLabel.trim(), icon: newIcon, url: data.secure_url }];
      newLabel = '';
      newFile  = null;
      newIcon  = 'general';
      await persist();
    } catch (/** @type {any} */ err) {
      uploadError = err.message;
    } finally {
      uploading = false;
    }
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
    Upload PDF files for visitors to download. Each entry appears in the CV popup with its category icon.
  </p>

  {#if loading}
    <p class="hint">Loading…</p>
  {:else}

    <!-- ── Existing CVs ─────────────────────────── -->
    {#if cvs.length}
    <div class="cv-list">
      {#each cvs as cv, i}
        {@const ic = ICON_MAP[cv.icon] ?? ICON_MAP.general}
        {@const Icon = ic.Icon}
        <div class="cv-row">
          <div class="icon-badge">
            <Icon size={15} weight="regular" />
          </div>
          <span class="cv-row-label">{cv.label}</span>
          <span class="cv-row-type">{ic.label}</span>
          <a class="cv-row-link" href={cv.url} target="_blank" rel="noopener noreferrer">Preview ↗</a>
          <button class="del-btn" onclick={() => removeCv(i)} aria-label="Remove">×</button>
        </div>
      {/each}
    </div>
    {:else}
      <p class="hint">No CVs yet — add one below.</p>
    {/if}

    <!-- ── Add New CV ────────────────────────────── -->
    <div class="add-section">
      <h2 class="section-label">Add New CV</h2>

      <div class="add-form">
        <div class="field">
          <label class="field-label" for="cv-icon">Category Icon</label>
          <div class="select-wrap">
            <select id="cv-icon" class="sel" bind:value={newIcon}>
              {#each ICONS as ic}
                <option value={ic.id}>{ic.label}</option>
              {/each}
            </select>
            <span class="sel-arrow">▾</span>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="cv-label">Label</label>
          <input
            id="cv-label"
            class="text-input"
            type="text"
            placeholder="e.g. Tech CV — English"
            bind:value={newLabel}
          />
        </div>

        <div class="field">
          <span class="field-label">PDF File</span>
          <label class="file-pick">
            <input
              type="file"
              accept=".pdf,application/pdf"
              class="file-hidden"
              onchange={(e) => { newFile = e.currentTarget.files?.[0] ?? null; uploadError = ''; }}
            />
            <span class="file-btn" class:has-file={!!newFile}>
              {newFile ? '✓ ' + newFile.name : 'Choose PDF…'}
            </span>
          </label>
        </div>

        {#if uploadError}
          <p class="error-msg">{uploadError}</p>
        {/if}

        <button
          class="action-btn"
          onclick={addCv}
          disabled={!newLabel.trim() || !newFile || uploading}
        >
          {uploading ? 'Uploading…' : 'Upload & Save'}
        </button>
      </div>
    </div>

    <!-- ── Resume link ───────────────────────────── -->
    <div class="resume-section">
      <h2 class="section-label">Resume Link</h2>
      <p class="desc" style="margin:0">
        Paste a link to your online resume (Google Docs, Notion, etc.). Shows as "Read Resume" at the bottom of the popup.
      </p>
      <div class="resume-row">
        <input
          class="text-input"
          type="url"
          placeholder="https://docs.google.com/…"
          bind:value={resumeUrl}
        />
        <button class="action-btn" onclick={persist} disabled={saving} style="align-self:flex-end">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>

  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; gap: 2rem; max-width: 680px; }

  .page-header { display: flex; align-items: center; gap: 1rem; }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .saved-badge { font-family: var(--font-body); font-size: 0.75rem; color: #38a169; font-weight: 600; }

  .desc { font-family: var(--font-body); font-size: 0.82rem; line-height: 1.65; color: var(--text-muted); margin: 0; }

  .hint { font-family: var(--font-body); font-size: 0.82rem; color: var(--text-muted); }

  /* CV list */
  .cv-list { display: flex; flex-direction: column; }

  .cv-row {
    display: grid;
    grid-template-columns: 32px 1fr auto auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--bg-card);
  }

  .icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
  }

  .cv-row-label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--text);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .cv-row-type {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .cv-row-link {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--accent);
    text-decoration: none;
    white-space: nowrap;
  }
  .cv-row-link:hover { text-decoration: underline; }

  .del-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: pointer;
    transition: color 0.15s ease;
    padding: 0;
    line-height: 1;
  }
  .del-btn:hover { color: #e53e3e; }

  /* Sections */
  .add-section, .resume-section {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--bg-card);
  }

  .section-label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin: 0;
  }

  .add-form { display: flex; flex-direction: column; gap: 1.125rem; }

  .field { display: flex; flex-direction: column; gap: 0.4rem; }

  .field-label {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  /* Select */
  .select-wrap { position: relative; display: inline-flex; align-items: center; max-width: 220px; }

  .sel {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.35rem 1.75rem 0.35rem 0;
    font-family: var(--font-body);
    font-size: 0.875rem;
    cursor: pointer;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
  }
  .sel:focus { border-bottom-color: var(--accent); }

  .sel-arrow { position: absolute; right: 0.5rem; pointer-events: none; font-size: 0.6rem; color: var(--text-muted); }

  /* Text input */
  .text-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    padding: 0.35rem 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
  }
  .text-input:focus { border-bottom-color: var(--accent); }

  /* File picker */
  .file-pick { display: inline-flex; cursor: pointer; }
  .file-hidden { display: none; }

  .file-btn {
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-muted);
    border: 1px solid var(--bg-card);
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    max-width: 380px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
  .file-btn:hover,
  .file-btn.has-file { border-color: var(--accent); color: var(--text); }

  /* Buttons */
  .action-btn {
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.5rem 1.375rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }
  .action-btn:hover:not(:disabled) { opacity: 0.88; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .error-msg { font-family: var(--font-body); font-size: 0.82rem; color: #e53e3e; margin: 0; }

  /* Resume row */
  .resume-row {
    display: flex;
    gap: 0.875rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .resume-row .text-input { flex: 1; min-width: 200px; }

  @media (max-width: 640px) {
    .cv-row { grid-template-columns: 32px 1fr auto auto; }
    .cv-row-type { display: none; }
  }
</style>
