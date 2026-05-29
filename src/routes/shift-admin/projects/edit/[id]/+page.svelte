<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { convertToWebP } from '$lib/utils/convertWebP.js';
  import { uploadToStorage } from '$lib/utils/uploadToStorage.js';

  let loading   = $state(true);
  let notFound  = $state(false);
  let saving    = $state(false);
  let saveError = $state('');

  let title       = $state('');
  let slug        = $state('');
  let category    = $state(/** @type {'dev' | 'digital' | 'pfe'} */ ('dev'));
  let tagsStr     = $state('');
  let description = $state('');
  let article     = $state('');
  let stackStr    = $state('');
  /** @type {{ label: string; value: string }[]} */
  let kpis        = $state([{ label: '', value: '' }]);
  let status      = $state(/** @type {'Live' | 'In Progress' | 'Case Study'} */ ('Live'));
  let githubUrl    = $state('');
  let demoUrl      = $state('');
  let loomUrl      = $state('');
  let previewUrl   = $state('');
  let previewLabel = $state('');
  let published    = $state(false);
  let thumbUrl         = $state('');
  let imagePreviewUrl  = $state('');
  let uploadStatus     = $state(/** @type {'idle'|'converting'|'uploading'|'done'|'error'} */ ('idle'));
  let existingThumbUrl = $state('');

  /* ── AI Article Generator ────────────────── */
  let aiContext    = $state('');
  let aiGenerating = $state(false);
  let aiGenError   = $state('');
  let aiGenSuccess = $state(false);

  async function generateArticleContent() {
    if (aiGenerating) return;
    aiGenerating = true;
    aiGenError   = '';
    aiGenSuccess = false;
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          tags: tagsStr,
          stack: stackStr,
          kpis,
          context: aiContext.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.description) description = data.description;
      if (data.article) article = data.article;
      if (data.kpis && Array.isArray(data.kpis)) {
        kpis = data.kpis.map((k) => ({ label: k.label ?? '', value: k.value ?? '' }));
      }
      aiGenSuccess = true;
    } catch (err) {
      console.error(err);
      aiGenError = err.message || 'Failed to generate article. Make sure OpenRouter key is set.';
    } finally {
      aiGenerating = false;
    }
  }


  onMount(async () => {
    const snap = await getDoc(doc(db, 'projects', $page.params.id));
    if (!snap.exists()) {
      notFound = true;
      loading  = false;
      return;
    }
    const d = /** @type {any} */ (snap.data());
    title       = d.title        ?? '';
    slug        = d.slug         ?? '';
    category    = d.category     ?? 'dev';
    tagsStr     = (d.tags  ?? []).join(', ');
    description = d.description  ?? '';
    article     = d.article      ?? '';
    stackStr    = (d.stack ?? []).join(', ');
    kpis        = d.kpis?.length ? d.kpis.map((/** @type {any} */ k) => ({ label: k.label ?? '', value: k.value ?? '' })) : [{ label: '', value: '' }];
    status      = d.status       ?? 'Live';
    githubUrl   = d.links?.github ?? '';
    demoUrl     = d.links?.demo   ?? '';
    loomUrl     = d.links?.loom   ?? '';
    previewUrl   = d.links?.preview ?? '';
    previewLabel = d.links?.previewLabel ?? '';
    published        = d.published    ?? false;
    thumbUrl         = d.thumbUrl     ?? '';
    existingThumbUrl = d.thumbUrl || ((d.imageCount ?? 0) > 0 ? `/images/projects/${d.slug}-thumb.webp` : '');
    loading     = false;
  });

  function addKpi() { kpis = [...kpis, { label: '', value: '' }]; }

  /** @param {number} i */
  function removeKpi(i) {
    if (kpis.length > 1) kpis = kpis.filter((_, idx) => idx !== i);
  }

  /** Converts the chosen image to WebP and uploads it directly to static/images/projects/ */
  async function handleImageUpload(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    uploadStatus = 'converting';
    try {
      // Step 1 — convert to WebP in the browser
      const blob = await convertToWebP(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      imagePreviewUrl = URL.createObjectURL(blob);

      // Step 2 — upload to Firebase Storage
      uploadStatus     = 'uploading';
      thumbUrl         = await uploadToStorage(blob, 'projects', `${slug}-thumb.webp`);
      existingThumbUrl = thumbUrl;
      uploadStatus     = 'done';
    } catch {
      uploadStatus = 'error';
    }
  }

  /** @param {boolean} pub */
  async function save(pub) {
    if (saving) return;
    saving    = true;
    saveError = '';
    try {
      const links = /** @type {Record<string, string>} */ ({});
      if (githubUrl.trim()) links.github = githubUrl.trim();
      if (demoUrl.trim())   links.demo   = demoUrl.trim();
      if (loomUrl.trim())   links.loom   = loomUrl.trim();
      if (previewUrl.trim()) {
        links.preview      = previewUrl.trim();
        links.previewLabel = previewLabel.trim() || 'Visit Platform';
      }

      await updateDoc(doc(db, 'projects', $page.params.id), {
        title:       title.trim(),
        category,
        tags:        tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
        description: description.trim(),
        article:     article.trim(),
        stack:       stackStr.split(',').map((t) => t.trim()).filter(Boolean),
        kpis:        kpis.filter((k) => k.label && k.value),
        status,
        links,
        thumbUrl,
        published:   pub,
        updatedAt:   serverTimestamp()
      });
      goto('/shift-admin/projects');
    } catch {
      saveError = 'Failed to save. Check your connection.';
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Project — Shift Admin</title>
</svelte:head>

<div class="edit-page">

  <nav class="breadcrumb">
    <a href="/shift-admin/projects">Projects</a>
    <span>/</span>
    <span>Edit</span>
  </nav>

  {#if loading}
    <p class="hint">Loading project…</p>
  {:else if notFound}
    <div class="not-found">
      <p>Project not found.</p>
      <a href="/shift-admin/projects">Back to Projects</a>
    </div>
  {:else}

    <div class="page-header">
      <div>
        <h1 class="page-title">{title || 'Edit Project'}</h1>
        <p class="slug-hint">/{slug}</p>
      </div>
    </div>

    <div class="form-grid">

      <!-- Title -->
      <div class="field full">
        <label for="fld_h0rb4z">Title</label>
        <input id="fld_h0rb4z" type="text" bind:value={title} />
      </div>

      <!-- Category + Status -->
      <div class="field">
        <label for="fld_qar9x1">Category</label>
        <select id="fld_qar9x1" bind:value={category}>
          <option value="dev">Dev</option>
          <option value="digital">Digital</option>
          <option value="pfe">Academic</option>
        </select>
      </div>

      <div class="field">
        <label for="fld_h003j0">Status</label>
        <select id="fld_h003j0" bind:value={status}>
          <option value="Live">Live</option>
          <option value="In Progress">In Progress</option>
          <option value="Case Study">Case Study</option>
        </select>
      </div>

      <!-- Tags -->
      <div class="field full">
        <label for="fld_jz1l3v">Tags <span class="field-hint">comma separated</span></label>
        <input id="fld_jz1l3v" type="text" bind:value={tagsStr} placeholder="SvelteKit, Firebase, Node.js" />
      </div>

      <!-- AI Generator Tool -->
      <div class="field full ai-generator-box">
        <div class="ai-generator-header">
          <label>Google X-Y-Z Article Generator</label>
          <span class="ai-badge">AI writer</span>
        </div>
        <div class="ai-generator-body">
          <textarea
            rows="2"
            class="ai-context-input"
            bind:value={aiContext}
            placeholder="Add quick points (e.g. 'Optimized site speed by 40% using image WebP compression, built custom router in Node.js')"
          ></textarea>
          <button
            type="button"
            class="ai-gen-btn"
            onclick={generateArticleContent}
            disabled={aiGenerating || !title.trim()}
          >
            {aiGenerating ? 'Generating...' : '✨ Auto-Write Description & Article'}
          </button>
        </div>
        {#if aiGenError}
          <p class="ai-gen-error">{aiGenError}</p>
        {:else if aiGenSuccess}
          <p class="ai-gen-success">✓ Description &amp; Article successfully updated below!</p>
        {/if}
      </div>

      <!-- Description -->
      <div class="field full">
        <label for="fld_1hx4ew">Description</label>
        <textarea id="fld_1hx4ew" rows="3" bind:value={description}></textarea>
      </div>

      <!-- Article -->
      <div class="field full">
        <label for="fld_jer577">Article <span class="field-hint">Markdown</span></label>
        <textarea id="fld_jer577" class="article-area" rows="14" bind:value={article}></textarea>
      </div>

      <!-- Stack (dev only) -->
      {#if category === 'dev'}
        <div class="field full">
          <label for="fld_y9uq8y">Stack <span class="field-hint">comma separated</span></label>
        <input id="fld_y9uq8y" type="text" bind:value={stackStr} placeholder="SvelteKit, Firebase, Vercel" />
        </div>
      {/if}

      <!-- KPIs -->
      <div class="field full">
        <label>KPIs</label>
        <div class="kpi-list">
          {#each kpis as kpi, i}
            <div class="kpi-row">
              <input class="kpi-label-in" type="text" bind:value={kpi.label} placeholder="Label" />
              <input class="kpi-value-in" type="text" bind:value={kpi.value} placeholder="Value" />
              <button
                class="kpi-remove"
                onclick={() => removeKpi(i)}
                disabled={kpis.length === 1}
                aria-label="Remove KPI"
              >×</button>
            </div>
          {/each}
          <button class="ghost-btn small" onclick={addKpi}>+ Add KPI</button>
        </div>
      </div>

      <!-- Links -->
      <div class="field">
        <label for="fld_h9b6e0">GitHub URL</label>
        <input id="fld_h9b6e0" type="url" bind:value={githubUrl} placeholder="https://github.com/user/repo" />
      </div>

      <div class="field">
        <label for="fld_0kmxh4">Demo URL</label>
        <input id="fld_0kmxh4" type="url" bind:value={demoUrl} placeholder="https://project.vercel.app" />
      </div>

      <div class="field full">
        <label for="fld_sro07a">Loom URL</label>
        <input id="fld_sro07a" type="url" bind:value={loomUrl} placeholder="https://www.loom.com/share/..." />
      </div>

      <!-- Preview Platform Button -->
      <div class="field">
        <label for="fld_q90f1f">Preview Platform URL <span class="field-hint">Actual platform website</span></label>
        <input id="fld_q90f1f" type="url" bind:value={previewUrl} placeholder="https://myplatform.com" />
      </div>

      <div class="field">
        <label for="fld_kjm4w7">Preview Button Label <span class="field-hint">Text shown on button (e.g. Visit Platform, Open App)</span></label>
        <input id="fld_kjm4w7" type="text" bind:value={previewLabel} placeholder="Visit Platform" />
      </div>

      <!-- Image upload -->
      <div class="field full">
        <label>Thumbnail <span class="field-hint">any image — auto-converts &amp; saved to disk as WebP</span></label>

        <!-- Show current thumbnail if one exists -->
        {#if existingThumbUrl && !imagePreviewUrl}
          <div class="image-preview current-thumb">
            <img src="{existingThumbUrl}?t={Date.now()}" alt="Current thumbnail" />
            <span class="thumb-badge">Current</span>
          </div>
        {/if}

        <input
          type="file"
          accept="image/*"
          class="file-input"
          onchange={handleImageUpload}
          disabled={uploadStatus === 'converting' || uploadStatus === 'uploading'}
        />

        <!-- New WebP preview after conversion -->
        {#if imagePreviewUrl}
          <div class="image-preview">
            <img src={imagePreviewUrl} alt="New thumbnail preview" />
          </div>
        {/if}

        <!-- Upload status feedback -->
        {#if uploadStatus === 'converting'}
          <p class="upload-status">Converting to WebP…</p>
        {:else if uploadStatus === 'uploading'}
          <p class="upload-status">Uploading to server…</p>
        {:else if uploadStatus === 'done'}
          <p class="upload-status done">✓ Uploaded to Firebase Storage</p>
        {:else if uploadStatus === 'error'}
          <p class="upload-status error">Upload failed — check the server is running locally.</p>
        {/if}
      </div>

      <!-- Published toggle -->
      <div class="field full">
        <div class="pub-toggle-row">
          <label class="toggle-label" for="pub-toggle">
            <label class="toggle">
              <input id="pub-toggle" type="checkbox" bind:checked={published} />
              <span class="track"></span>
            </label>
            <span class="pub-state">{published ? 'Published' : 'Draft'}</span>
          </label>
        </div>
      </div>

    </div>

    {#if saveError}
      <p class="save-error">{saveError}</p>
    {/if}

    <div class="save-row">
      <button class="draft-btn" onclick={() => save(false)} disabled={saving || !title.trim()}>
        {saving ? 'Saving…' : 'Save as Draft'}
      </button>
      <button class="publish-btn" onclick={() => save(true)} disabled={saving || !title.trim()}>
        {saving ? 'Saving…' : 'Save & Publish'}
      </button>
    </div>

  {/if}
</div>

<style>
  .edit-page { display: flex; flex-direction: column; gap: 2rem; }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.15s ease; }
  .breadcrumb a:hover { color: var(--accent); }

  .page-header { display: flex; align-items: flex-start; justify-content: space-between; }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin: 0 0 0.2rem;
  }

  .slug-hint {
    font-family: 'Courier New', monospace;
    font-size: 0.72rem;
    color: var(--text-muted);
    margin: 0;
  }

  /* Form */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 2rem;
  }

  .field { display: flex; flex-direction: column; gap: 0.35rem; }
  .field.full { grid-column: 1 / -1; }

  .field label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .field-hint { font-size: 0.6rem; font-weight: 500; text-transform: none; letter-spacing: 0; opacity: 0.7; }

  .field input,
  .field select,
  .field textarea {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    padding: 0.45rem 0;
    outline: none;
    width: 100%;
    transition: border-color 0.2s ease;
  }

  .field select { appearance: none; cursor: pointer; }
  .field input:focus, .field select:focus, .field textarea:focus { border-bottom-color: var(--accent); }
  .field textarea { resize: vertical; line-height: 1.6; }
  .article-area { min-height: 280px; }

  /* KPI editor */
  .kpi-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .kpi-row { display: grid; grid-template-columns: 1fr 1fr 28px; gap: 0.75rem; align-items: end; }

  .kpi-label-in, .kpi-value-in {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    padding: 0.45rem 0;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .kpi-label-in:focus, .kpi-value-in:focus { border-bottom-color: var(--accent); }

  .kpi-remove {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    cursor: pointer;
    padding: 0 0.25rem;
    line-height: 1;
    transition: color 0.15s ease;
  }

  .kpi-remove:hover:not(:disabled) { color: #e53e3e; }
  .kpi-remove:disabled { opacity: 0.2; cursor: not-allowed; }

  /* File input */
  .file-input {
    border: none !important;
    border-bottom: none !important;
    padding: 0 !important;
    font-size: 0.8rem !important;
    color: var(--text-muted) !important;
    cursor: pointer;
  }

  .image-preview { margin-top: 0.5rem; width: 160px; height: 90px; background: var(--bg-card); overflow: hidden; }
  .image-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }



  /* Current thumbnail overlay badge */
  .image-preview.current-thumb { position: relative; }
  .thumb-badge {
    position: absolute;
    top: 6px; left: 6px;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
  }

  /* Upload progress / result messages */
  .upload-status {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 0.4rem;
  }

  .upload-status.done  { color: #38a169; }
  .upload-status.error { color: #e53e3e; }

  /* AI Generator styles */
  .ai-generator-box {
    background: var(--bg-card);
    border: 1px dashed var(--accent);
    padding: 1.25rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  .ai-generator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .ai-badge {
    background: var(--accent);
    color: #fff;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .ai-generator-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .ai-context-input {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0.6rem;
    font-size: 0.85rem;
    border-radius: 3px;
    outline: none;
    resize: vertical;
    width: 100%;
  }
  .ai-context-input:focus {
    border-color: var(--accent);
  }
  .ai-gen-btn {
    align-self: flex-start;
    background: var(--text);
    color: var(--bg);
    border: none;
    padding: 0.5rem 1.2rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 3px;
    transition: opacity 0.2s ease;
  }
  .ai-gen-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  .ai-gen-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .ai-gen-error {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: #e53e3e;
    margin-top: 0.5rem;
  }
  .ai-gen-success {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: #38a169;
    margin-top: 0.5rem;
  }

  /* Published toggle */
  .pub-toggle-row { padding: 0.5rem 0; }

  .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }

  .pub-state { font-family: var(--font-body); font-size: 0.875rem; font-weight: 500; color: var(--text); }

  .toggle input { display: none; }

  .track {
    width: 34px;
    height: 19px;
    border-radius: 10px;
    background: var(--bg-card);
    border: 1.5px solid var(--text-muted);
    position: relative;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .track::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 11px; height: 11px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .toggle input:checked + .track { background: var(--accent); border-color: var(--accent); }
  .toggle input:checked + .track::after { transform: translateX(15px); background: #fff; }

  /* Save row */
  .save-error { font-family: var(--font-body); font-size: 0.8rem; color: #e53e3e; }

  .save-row { display: flex; gap: 0.875rem; align-items: center; padding-top: 0.5rem; }

  .draft-btn {
    background: transparent;
    border: 1px solid var(--text-muted);
    color: var(--text);
    padding: 0.75rem 1.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s ease, opacity 0.2s ease;
  }

  .draft-btn:hover:not(:disabled) { border-color: var(--text); }
  .draft-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .publish-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.75rem 1.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .publish-btn:hover:not(:disabled) { opacity: 0.88; }
  .publish-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .ghost-btn {
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.78rem;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .ghost-btn:hover { color: var(--text); border-color: var(--text-muted); }
  .ghost-btn.small { font-size: 0.75rem; padding: 0.25rem 0.6rem; align-self: flex-start; }

  /* Not found */
  .not-found { font-family: var(--font-body); font-size: 0.9rem; color: var(--text); }
  .not-found a { color: var(--accent); text-decoration: underline; }

  .hint { font-family: var(--font-body); font-size: 0.82rem; color: var(--text-muted); }

  @media (max-width: 640px) {
    .form-grid { grid-template-columns: 1fr; }
    .field.full { grid-column: 1; }
  }
</style>
