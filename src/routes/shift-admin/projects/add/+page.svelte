<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { convertToWebP } from '$lib/utils/convertWebP.js';
  import { uploadToStorage } from '$lib/utils/uploadToStorage.js';
  import { categoriesFor, loadCategories, DEFAULT_CATEGORIES } from '$lib/categories.js';

  let taxonomy = $state(DEFAULT_CATEGORIES);
  onMount(async () => { taxonomy = await loadCategories(); });

  /* ── Wizard state ───────────────────────────── */
  let step        = $state(1);
  let pasteInput  = $state('');
  let parseError  = $state('');

  /* ── Form fields (Step 2) ───────────────────── */
  let title        = $state('');
  let category     = $state(/** @type {'dev' | 'digital' | 'pfe'} */ ('dev'));
  /** Selected categories (sub-tags), stored on the project's `tags` array */
  let tags         = $state(/** @type {string[]} */ ([]));
  let customCat    = $state('');
  let description  = $state('');
  let article      = $state('');
  let stackStr     = $state('');
  /** @type {{ label: string; value: string }[]} */
  let kpis         = $state([{ label: '', value: '' }]);
  let status       = $state(/** @type {'Live' | 'In Progress' | 'Case Study'} */ ('Live'));
  let githubUrl    = $state('');
  let demoUrl      = $state('');
  let loomUrl      = $state('');
  let previewUrl   = $state('');
  let previewLabel = $state('');
  /* ── Digital showcase (Behance / external link) ─ */
  let behanceUrl   = $state('');
  let behanceLabel = $state('Behance');
  /* ── Academic doc (presentation / PDF link) ───── */
  let documentUrl   = $state('');
  let documentLabel = $state('View PDF');
  let showcaseNote = $state('');
  let published    = $state(false);

  /* ── Image upload ───────────────────────────── */
  let imagePreviewUrl = $state('');
  let thumbUrl        = $state('');
  let uploadStatus    = $state(/** @type {'idle'|'converting'|'uploading'|'done'|'error'} */ ('idle'));

  /* ── Screenshots gallery (optional, dev) ──────── */
  /** @type {string[]} */
  let screenshots = $state([]);
  let shotStatus  = $state(/** @type {'idle'|'working'|'error'} */ ('idle'));
  let shotError   = $state('');

  let saving      = $state(false);
  let saveError   = $state('');

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
          tags: tags.join(', '),
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


  /* ── AI prompt ──────────────────────────────── */
  const AI_PROMPT =
`You are helping log a project for a portfolio. Based on the project I describe, return ONLY a valid JSON object with no markdown, no explanation, no backticks. The JSON must have these exact keys:
{
  "title": "string",
  "category": "dev" | "digital" | "pfe",
  "tags": ["string"],
  "description": "string (2-3 sentences)",
  "article": "string (full markdown article, 3-5 paragraphs)",
  "stack": ["string"] (only for dev projects, else empty array),
  "kpis": [{"label": "string", "value": "string"}] (3-5 metrics),
  "status": "Live" | "In Progress" | "Case Study",
  "behance": "string" (ONLY for digital projects — URL to the Behance/portfolio/video showcase, else ""),
  "behanceLabel": "string" (ONLY for digital — button label, defaults to "Behance", else ""),
  "document": "string" (ONLY for pfe/academic projects — URL to the presentation/PDF/docs, else ""),
  "documentLabel": "string" (ONLY for pfe/academic — button label, defaults to "View PDF", else ""),
  "showcaseNote": "string" (ONLY for digital or pfe — one short sentence introducing the link, else "")
}

My project: [DESCRIBE YOUR PROJECT HERE]`;

  const REQUIRED = ['title', 'category', 'tags', 'description', 'article', 'stack', 'kpis', 'status'];

  async function copyPrompt() {
    await navigator.clipboard.writeText(AI_PROMPT);
  }

  function goNext() {
    parseError = '';
    let parsed;
    try {
      parsed = JSON.parse(pasteInput.trim());
    } catch {
      parseError = 'Invalid JSON — check for syntax errors and make sure there are no markdown backticks.';
      return;
    }
    const missing = REQUIRED.filter((k) => !(k in parsed));
    if (missing.length > 0) {
      parseError = `Missing required keys: ${missing.join(', ')}`;
      return;
    }
    title       = parsed.title       ?? '';
    category    = parsed.category    ?? 'dev';
    tags        = Array.isArray(parsed.tags) ? parsed.tags.map((/** @type {any} */ t) => String(t).trim()).filter(Boolean) : [];
    description = parsed.description ?? '';
    article     = parsed.article     ?? '';
    stackStr    = (parsed.stack ?? []).join(', ');
    kpis        = parsed.kpis?.length ? parsed.kpis.map((/** @type {any} */ k) => ({ label: k.label ?? '', value: k.value ?? '' })) : [{ label: '', value: '' }];
    status      = parsed.status ?? 'Live';
    behanceUrl    = parsed.behance       ?? '';
    behanceLabel  = parsed.behanceLabel  || 'Behance';
    documentUrl   = parsed.document      ?? '';
    documentLabel = parsed.documentLabel || 'View PDF';
    showcaseNote  = parsed.showcaseNote  ?? '';
    step        = 2;
  }

  // Checkbox options = taxonomy for the current type + any already-selected tags
  // (so AI-suggested or legacy custom tags still show and stay editable).
  let catOptions = $derived([...new Set([...categoriesFor(taxonomy, category), ...tags])]);

  /** @param {string} cat */
  function toggleCat(cat) {
    tags = tags.includes(cat) ? tags.filter((t) => t !== cat) : [...tags, cat];
  }

  function addCustomCat() {
    const v = customCat.trim();
    if (v && !tags.includes(v)) tags = [...tags, v];
    customCat = '';
  }

  function addKpi() { kpis = [...kpis, { label: '', value: '' }]; }

  /** @param {number} i */
  function removeKpi(i) {
    if (kpis.length > 1) kpis = kpis.filter((_, idx) => idx !== i);
  }

  /** Converts the chosen image to WebP then POSTs it to the server so it lands in static/images/projects/ */
  async function handleImageUpload(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    uploadStatus = 'converting';
    try {
      // Step 1 — convert to WebP in the browser
      const blob = await convertToWebP(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      imagePreviewUrl = URL.createObjectURL(blob);

      // We need the slug to name the file — derive it live from the current title
      const fileSlug = generatedSlug || 'project-thumb';
      const filename  = `${fileSlug}-thumb.webp`;

      // Step 2 — upload to Firebase Storage
      uploadStatus = 'uploading';
      thumbUrl     = await uploadToStorage(blob, 'projects', filename);
      uploadStatus = 'done';
    } catch (err) {
      console.error('[thumbnail upload] failed:', err);
      uploadStatus = 'error';
    }
  }

  /** Converts & uploads one or more screenshots, appending each CDN URL to the gallery */
  async function handleScreenshotUpload(/** @type {Event & { currentTarget: HTMLInputElement }} */ e) {
    // Capture the input element now — after an `await`, e.currentTarget is null.
    const input = e.currentTarget;
    const files = input.files;
    if (!files?.length) return;
    shotStatus = 'working';
    shotError  = '';
    try {
      const baseSlug = generatedSlug || 'project';
      for (const file of Array.from(files)) {
        const blob     = await convertToWebP(file);
        const filename = `${baseSlug}-shot-${Date.now()}-${screenshots.length}.webp`;
        const url      = await uploadToStorage(blob, 'projects', filename);
        screenshots = [...screenshots, url];
      }
      shotStatus = 'idle';
      input.value = '';
    } catch (err) {
      console.error('[screenshot upload] failed:', err);
      shotError  = err instanceof Error ? err.message : String(err);
      shotStatus = 'error';
    }
  }

  /** @param {number} i */
  function removeScreenshot(i) {
    screenshots = screenshots.filter((_, idx) => idx !== i);
  }

  /** @param {string} str */
  function slugify(str) {
    return str.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /** @param {boolean} pub */
  async function save(pub) {
    if (saving) return;
    saving    = true;
    saveError = '';
    try {
      const slug  = slugify(title);
      const links = /** @type {Record<string, string>} */ ({});
      if (category === 'digital') {
        // Digital work showcases through an external link (Behance, video, gallery…) — no GitHub.
        if (behanceUrl.trim()) {
          links.behance      = behanceUrl.trim();
          links.behanceLabel = behanceLabel.trim() || 'Behance';
        }
      } else if (category === 'pfe') {
        // Academic work showcases through a document link (presentation, PDF, docs…) — no GitHub.
        if (documentUrl.trim()) {
          links.document      = documentUrl.trim();
          links.documentLabel = documentLabel.trim() || 'View PDF';
        }
      } else {
        if (githubUrl.trim()) links.github = githubUrl.trim();
        if (demoUrl.trim())   links.demo   = demoUrl.trim();
        if (loomUrl.trim())   links.loom   = loomUrl.trim();
        if (previewUrl.trim()) {
          links.preview      = previewUrl.trim();
          links.previewLabel = previewLabel.trim() || 'Visit Platform';
        }
      }

      await addDoc(collection(db, 'projects'), {
        title:       title.trim(),
        slug,
        category,
        tags:        tags,
        description: description.trim(),
        article:     article.trim(),
        stack:       category === 'digital' ? [] : stackStr.split(',').map((t) => t.trim()).filter(Boolean),
        kpis:        kpis.filter((k) => k.label && k.value),
        status,
        links,
        screenshots: category === 'dev' ? screenshots : [],
        showcaseNote: (category === 'digital' || category === 'pfe') ? showcaseNote.trim() : '',
        thumbUrl,
        published:   pub,
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp()
      });
      goto('/shift-admin/projects');
    } catch (err) {
      console.error('[save project] failed:', err);
      saveError = 'Failed to save. Check your connection and try again.';
      saving = false;
    }
  }

  let generatedSlug = $derived(slugify(title));
</script>

<svelte:head>
  <title>Add Project — Shift Admin</title>
</svelte:head>

<div class="add-page">

  <!-- Breadcrumb -->
  <nav class="breadcrumb">
    <a href="/shift-admin/projects">Projects</a>
    <span>/</span>
    <span>{step === 1 ? 'Brief AI' : 'Review & Publish'}</span>
  </nav>

  <!-- ══ STEP 1: AI Briefing ══════════════════════ -->
  {#if step === 1}

    <h1 class="page-title">Brief your AI</h1>

    <div class="step1-layout">

      <!-- Prompt display -->
      <div class="prompt-block">
        <div class="block-header">
          <span class="block-label">Copy this prompt into your AI</span>
          <button class="ghost-btn" onclick={copyPrompt}>Copy Prompt</button>
        </div>
        <textarea class="prompt-area" readonly>{AI_PROMPT}</textarea>
      </div>

      <!-- Paste response -->
      <div class="paste-block">
        <label class="block-label" for="paste-area">Paste the AI's JSON response</label>
        <textarea
          id="paste-area"
          class="paste-area"
          bind:value={pasteInput}
          placeholder={'{ "title": "...", "category": "dev", ... }'}
        ></textarea>

        {#if parseError}
          <p class="parse-error">{parseError}</p>
        {/if}

        <button
          class="next-btn"
          onclick={goNext}
          disabled={!pasteInput.trim()}
        >Next →</button>
      </div>

    </div>

  <!-- ══ STEP 2: Review & Publish ════════════════ -->
  {:else}

    <div class="step2-header">
      <h1 class="page-title">Review &amp; Publish</h1>
      <button class="ghost-btn" onclick={() => (step = 1)}>← Back</button>
    </div>

    <div class="form-grid">

      <!-- Title -->
      <div class="field full">
        <label for="fld_3l5pfw">Title</label>
        <input id="fld_3l5pfw" type="text" bind:value={title} />
      </div>

      <!-- Category + Status -->
      <div class="field">
        <label for="fld_vmcfga">Category</label>
        <select id="fld_vmcfga" bind:value={category}>
          <option value="dev">Dev</option>
          <option value="digital">Digital</option>
          <option value="pfe">Academic</option>
        </select>
      </div>

      <div class="field">
        <label for="fld_ucehty">Status</label>
        <select id="fld_ucehty" bind:value={status}>
          <option value="Live">Live</option>
          <option value="In Progress">In Progress</option>
          <option value="Case Study">Case Study</option>
        </select>
      </div>

      <!-- Categories (sub-tags) — options change with the project type -->
      <div class="field full">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label>Categories <span class="field-hint">tick all that apply — drives the front-site filter</span></label>
        <div class="cat-grid">
          {#each catOptions as cat}
            <label class="cat-chip" class:checked={tags.includes(cat)}>
              <input type="checkbox" checked={tags.includes(cat)} onchange={() => toggleCat(cat)} />
              <span>{cat}</span>
            </label>
          {/each}
        </div>
        <div class="cat-custom">
          <input
            type="text"
            bind:value={customCat}
            placeholder="Add a custom category…"
            onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCat())}
          />
          <button type="button" class="ghost-btn small" onclick={addCustomCat} disabled={!customCat.trim()}>+ Add</button>
        </div>
      </div>

      <!-- AI Generator Tool -->
      <div class="field full ai-generator-box">
        <div class="ai-generator-header">
          <!-- svelte-ignore a11y_label_has_associated_control -->
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
        <label for="fld_1xzkko">Description</label>
        <textarea id="fld_1xzkko" rows="3" bind:value={description}></textarea>
      </div>

      <!-- Article -->
      <div class="field full">
        <label for="fld_5jrqjk">Article <span class="field-hint">Markdown</span></label>
        <textarea id="fld_5jrqjk" class="article-area" rows="14" bind:value={article}></textarea>
      </div>

      <!-- Stack (dev only) -->
      {#if category === 'dev'}
        <div class="field full">
          <label for="fld_jeff1f">Stack <span class="field-hint">comma separated</span></label>
        <input id="fld_jeff1f" type="text" bind:value={stackStr} placeholder="SvelteKit, Firebase, Vercel" />
        </div>
      {/if}

      <!-- KPIs -->
      <div class="field full">
        <!-- svelte-ignore a11y_label_has_associated_control -->
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
      {#if category === 'digital'}
        <!-- Digital: external showcase link (Behance / video / gallery) — no GitHub -->
        <div class="field">
          <label for="fld_behurl">Showcase URL <span class="field-hint">Behance, Dribbble, video, gallery…</span></label>
          <input id="fld_behurl" type="url" bind:value={behanceUrl} placeholder="https://www.behance.net/gallery/..." />
        </div>

        <div class="field">
          <label for="fld_behlbl">Showcase Button Label <span class="field-hint">Defaults to Behance — switch to anything</span></label>
          <input id="fld_behlbl" type="text" bind:value={behanceLabel} placeholder="Behance" />
        </div>

        <div class="field full">
          <label for="fld_shownote">Showcase Note <span class="field-hint">Short paragraph shown next to the showcase button</span></label>
          <textarea id="fld_shownote" rows="2" bind:value={showcaseNote} placeholder="See the full brand identity, moodboard and final deliverables on Behance."></textarea>
        </div>
      {:else if category === 'pfe'}
        <!-- Academic: document link (presentation / PDF / docs) — no GitHub -->
        <div class="field">
          <label for="fld_docurl">Document URL <span class="field-hint">Presentation, PDF, Google Docs…</span></label>
          <input id="fld_docurl" type="url" bind:value={documentUrl} placeholder="https://drive.google.com/file/d/..." />
        </div>

        <div class="field">
          <label for="fld_doclbl">Document Button Label <span class="field-hint">Defaults to View PDF — switch to anything</span></label>
          <input id="fld_doclbl" type="text" bind:value={documentLabel} placeholder="View PDF" />
        </div>

        <div class="field full">
          <label for="fld_docnote">Document Note <span class="field-hint">Short paragraph shown next to the document button</span></label>
          <textarea id="fld_docnote" rows="2" bind:value={showcaseNote} placeholder="Read the full thesis, defense slides and supporting research."></textarea>
        </div>
      {:else}
        <div class="field">
          <label for="fld_0xmpw2">GitHub URL</label>
          <input id="fld_0xmpw2" type="url" bind:value={githubUrl} placeholder="https://github.com/user/repo" />
        </div>

        <div class="field">
          <label for="fld_1up5zx">Demo URL</label>
          <input id="fld_1up5zx" type="url" bind:value={demoUrl} placeholder="https://project.vercel.app" />
        </div>

        <div class="field full">
          <label for="fld_nli0o9">Loom URL</label>
          <input id="fld_nli0o9" type="url" bind:value={loomUrl} placeholder="https://www.loom.com/share/..." />
        </div>

        <!-- Preview Platform Button -->
        <div class="field">
          <label for="fld_x134kl">Preview Platform URL <span class="field-hint">Actual platform website</span></label>
          <input id="fld_x134kl" type="url" bind:value={previewUrl} placeholder="https://myplatform.com" />
        </div>

        <div class="field">
          <label for="fld_tgj9xq">Preview Button Label <span class="field-hint">Text shown on button (e.g. Visit Platform, Open App)</span></label>
          <input id="fld_tgj9xq" type="text" bind:value={previewLabel} placeholder="Visit Platform" />
        </div>
      {/if}

      <!-- Image upload -->
      <div class="field full">
        <label for="thumbnail-input">Thumbnail <span class="field-hint">any image — auto-converts &amp; uploads to Firebase Storage as WebP</span></label>
        <input
          id="thumbnail-input"
          type="file"
          accept="image/*"
          class="file-input"
          onchange={handleImageUpload}
          disabled={uploadStatus === 'converting' || uploadStatus === 'uploading'}
        />
        {#if imagePreviewUrl}
          <div class="image-preview">
            <img src={imagePreviewUrl} alt="WebP preview" />
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
          <p class="upload-status error">Upload failed — check the dev server is running.</p>
        {/if}
      </div>

      <!-- Screenshots gallery (optional — great for private projects without a repo/demo) -->
      {#if category === 'dev'}
        <div class="field full">
          <label for="screenshots-input">Screenshots <span class="field-hint">optional — shown before the article. Ideal for private work with no public repo or demo.</span></label>
          <input
            id="screenshots-input"
            type="file"
            accept="image/*"
            multiple
            class="file-input"
            onchange={handleScreenshotUpload}
            disabled={shotStatus === 'working'}
          />
          {#if shotStatus === 'working'}
            <p class="upload-status">Converting &amp; uploading…</p>
          {:else if shotStatus === 'error'}
            <p class="upload-status error">Upload failed — {shotError || 'try again.'}</p>
          {/if}
          {#if screenshots.length}
            <div class="shots-grid">
              {#each screenshots as shot, i}
                <div class="shot-thumb">
                  <img src={shot} alt="Screenshot {i + 1}" />
                  <button type="button" class="shot-remove" onclick={() => removeScreenshot(i)} aria-label="Remove screenshot">×</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

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

    <!-- Save buttons -->
    <div class="save-row">
      <button class="draft-btn" onclick={() => save(false)} disabled={saving || !title.trim()}>
        {saving ? 'Saving…' : 'Save Draft'}
      </button>
      <button class="publish-btn" onclick={() => save(true)} disabled={saving || !title.trim()}>
        {saving ? 'Saving…' : 'Publish'}
      </button>
    </div>

  {/if}

</div>

<style>
  .add-page { display: flex; flex-direction: column; gap: 2rem; }

  /* ── Breadcrumb ─────────────────────────────── */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .breadcrumb a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .breadcrumb a:hover { color: var(--accent); }

  /* ── Page title ─────────────────────────────── */
  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  /* ── Step 1 ─────────────────────────────────── */
  .step1-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.625rem;
  }

  .block-label {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .prompt-area {
    width: 100%;
    height: 420px;
    background: var(--bg-card);
    border: none;
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.8rem;
    line-height: 1.6;
    padding: 1rem;
    resize: none;
    outline: none;
    box-sizing: border-box;
    cursor: default;
  }

  .paste-block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .paste-area {
    width: 100%;
    height: 360px;
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.55;
    padding: 0.875rem;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
  }

  .paste-area:focus { border-color: var(--accent); }

  .parse-error {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: #e53e3e;
  }

  .next-btn {
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

  .next-btn:hover:not(:disabled) { opacity: 0.88; }
  .next-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Step 2 ─────────────────────────────────── */
  .step2-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .field.full { grid-column: 1 / -1; }

  .field label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .field-hint {
    font-size: 0.6rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
    opacity: 0.7;
  }

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

  .field select {
    appearance: none;
    cursor: pointer;
    padding-right: 1.25rem;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus { border-bottom-color: var(--accent); }

  .field textarea { resize: vertical; line-height: 1.6; }
  .article-area   { min-height: 280px; }

  /* Category picker */
  .cat-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .cat-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--bg-card);
    border: 1px solid transparent;
    color: var(--text-muted);
    padding: 0.35rem 0.7rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  }

  .cat-chip:hover { color: var(--text); }

  .cat-chip.checked {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
  }

  .cat-chip input { display: none; }

  .cat-custom {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.7rem;
  }

  .cat-custom input {
    flex: 1;
    border-bottom: 1px solid var(--bg-card);
  }

  /* KPI editor */
  .kpi-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .kpi-row {
    display: grid;
    grid-template-columns: 1fr 1fr 28px;
    gap: 0.75rem;
    align-items: end;
  }

  .kpi-label-in,
  .kpi-value-in {
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

  .kpi-label-in:focus,
  .kpi-value-in:focus { border-bottom-color: var(--accent); }

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

  .image-preview {
    margin-top: 0.5rem;
    width: 160px;
    height: 90px;
    background: var(--bg-card);
    overflow: hidden;
  }

  .image-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Screenshots gallery editor */
  .shots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.6rem;
    margin-top: 0.6rem;
  }

  .shot-thumb {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--bg-card);
    overflow: hidden;
    border-radius: 3px;
  }

  .shot-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .shot-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
  }

  .shot-remove:hover { background: #e53e3e; }

  /* Upload status messages */
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

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .pub-state {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
  }

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
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .toggle input:checked + .track { background: var(--accent); border-color: var(--accent); }
  .toggle input:checked + .track::after { transform: translateX(15px); background: #fff; }

  /* Save row */
  .save-error {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: #e53e3e;
  }

  .save-row {
    display: flex;
    gap: 0.875rem;
    align-items: center;
    padding-top: 0.5rem;
  }

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

  /* ── Shared utility ─────────────────────────── */
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

  /* ── Responsive ─────────────────────────────── */
  @media (max-width: 900px) {
    .step1-layout { grid-template-columns: 1fr; }
    .prompt-area { height: 260px; }
  }

  @media (max-width: 640px) {
    .form-grid { grid-template-columns: 1fr; }
    .field.full { grid-column: 1; }
  }
</style>
