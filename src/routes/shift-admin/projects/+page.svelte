<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { db } from '$lib/firebase.js';
  import { categoriesFor, loadCategories, DEFAULT_CATEGORIES } from '$lib/categories.js';

  /** @type {any[]} */
  let allProjects = $state([]);
  let loading     = $state(true);
  let taxonomy    = $state(DEFAULT_CATEGORIES);

  let activeCategory = $state('');
  let activeTag      = $state('');
  let search         = $state('');

  /** @type {string | null} */
  let confirmDelete  = $state(null);

  // ── Export modal state ──────────────────────────
  let exportOpen   = $state(false);
  let exportJson   = $state('');
  let enriching    = $state(false);
  /** @type {string | null} */
  let exportError  = $state(null);
  let copied       = $state(false);

  let currentTags = $derived(categoriesFor(taxonomy, activeCategory));

  let filtered = $derived(
    allProjects.filter((p) => {
      const catOk = !activeCategory || p.category === activeCategory;
      const tagOk = !activeTag      || p.tags?.includes(activeTag);
      const q     = search.trim().toLowerCase();
      const searchOk =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return catOk && tagOk && searchOk;
    })
  );

  // Maps an internal project record to the requested export schema.
  /** @param {any} p */
  function toExportSchema(p) {
    const stack = Array.isArray(p.stack) && p.stack.length ? p.stack
                : Array.isArray(p.tags)  && p.tags.length  ? p.tags
                : null;
    const outcome = Array.isArray(p.kpis) && p.kpis.length
      ? p.kpis.map((/** @type {any} */ k) => `${k.label}: ${k.value}`).join(', ')
      : null;
    const url = p.links && typeof p.links === 'object'
      ? (Object.values(p.links).find((v) => !!v) ?? null)
      : null;
    return {
      id: null,
      name: p.title ?? null,
      description: p.description || null,
      type: null,
      technologies: null,
      tech_stack: stack,
      role: null,
      status: p.status || null,
      outcome,
      url
    };
  }

  function buildExportJson() {
    const projects = filtered.map(toExportSchema);
    return JSON.stringify({ projects }, null, 2);
  }

  function openExport() {
    exportError = null;
    copied = false;
    exportJson = buildExportJson();
    exportOpen = true;
  }

  function closeExport() {
    exportOpen = false;
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportJson);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch (_) { /* clipboard blocked */ }
  }

  // Ask OpenRouter to fill in the null/blank fields with realistic data.
  async function enrichWithAI() {
    enriching = true;
    exportError = null;
    try {
      const projects = JSON.parse(exportJson).projects;
      const res = await fetch('/api/enrich-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enrich projects');
      exportJson = JSON.stringify({ projects: data.projects }, null, 2);
    } catch (err) {
      exportError = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      enriching = false;
    }
  }

  onMount(async () => {
    loadCategories().then((t) => { taxonomy = t; });
    try {
      const snap  = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')));
      allProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } finally {
      loading = false;
    }
  });

  /** @param {string} id */
  async function handleDelete(id) {
    await deleteDoc(doc(db, 'projects', id));
    allProjects  = allProjects.filter((p) => p.id !== id);
    confirmDelete = null;
  }

  /** @param {string} tag */
  function toggleTag(tag) {
    activeTag = activeTag === tag ? '' : tag;
  }

  /** @param {string} status */
  function statusClass(status) {
    return (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }
</script>

<svelte:head>
  <title>Projects — Shift Admin</title>
</svelte:head>

<div class="projects-page">

  <div class="page-header">
    <h1 class="page-title">Projects</h1>
    <div class="header-actions">
      <button class="seed-link" type="button" onclick={openExport}>Export All</button>
      <a class="seed-link" href="/shift-admin/projects/seed">Bulk Import</a>
      <a class="add-btn" href="/shift-admin/projects/add">+ Add Project</a>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="select-wrap">
      <select
        class="cat-select"
        bind:value={activeCategory}
        onchange={() => (activeTag = '')}
      >
        <option value="">All</option>
        <option value="digital">Digital</option>
        <option value="dev">Dev</option>
        <option value="pfe">Academic</option>
      </select>
      <span class="select-arrow">▾</span>
    </div>

    <div class="tag-row">
      {#each currentTags as tag}
        <button
          class="tag-btn"
          class:active={activeTag === tag}
          onclick={() => toggleTag(tag)}
        >{tag}</button>
      {/each}
    </div>

    <input
      class="search-input"
      type="search"
      placeholder="Search title or tags…"
      bind:value={search}
    />
  </div>

  <!-- Project list -->
  {#if loading}
    <p class="hint">Loading…</p>
  {:else if filtered.length === 0}
    <p class="hint">No projects match this filter.</p>
  {:else}
    <div class="project-list">
      {#each filtered as p (p.id)}
        <div class="p-row">
          <!-- Thumbnail -->
          <div class="thumb">
            <img
              src={p.thumbUrl || `/images/projects/${p.slug ?? p.id}-thumb.webp`}
              alt={p.title}
              onerror={(e) => { /** @type {HTMLImageElement} */ (e.currentTarget).style.display = 'none'; }}
            />
          </div>

          <!-- Info -->
          <div class="p-info">
            <div class="p-title-row">
              <span class="p-title">{p.title}</span>
              {#if p.published === false}
                <span class="badge draft">DRAFT</span>
              {:else}
                <span class="badge {statusClass(p.status)}">{p.status}</span>
              {/if}
            </div>
            <span class="p-meta">{p.category} · {p.tags?.slice(0, 3).join(', ')}</span>
          </div>

          <!-- Actions -->
          <div class="p-actions">
            <button
              class="act edit"
              onclick={() => goto(`/shift-admin/projects/edit/${p.id}`)}
            >Edit</button>

            {#if confirmDelete === p.id}
              <button class="act confirm-del" onclick={() => handleDelete(p.id)}>Confirm</button>
              <button class="act cancel"      onclick={() => (confirmDelete = null)}>Cancel</button>
            {:else}
              <button class="act delete" onclick={() => (confirmDelete = p.id)}>Delete</button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

</div>

<!-- ── Export modal ─────────────────────────────── -->
{#if exportOpen}
  <div
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Export projects"
    tabindex="-1"
    onclick={closeExport}
    onkeydown={(e) => e.key === 'Escape' && closeExport()}
  >
    <div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2 class="modal-title">Export Projects ({filtered.length})</h2>
        <button class="modal-close" type="button" onclick={closeExport} aria-label="Close">×</button>
      </div>

      <p class="modal-sub">JSON of {filtered.length} project{filtered.length !== 1 ? 's' : ''} matching the current filters. Use the AI button to fill in any blank fields.</p>

      {#if exportError}
        <p class="modal-error">{exportError}</p>
      {/if}

      <textarea class="modal-json" readonly bind:value={exportJson} spellcheck="false"></textarea>

      <div class="modal-actions">
        <button class="m-btn ai" type="button" onclick={enrichWithAI} disabled={enriching}>
          {enriching ? 'Filling blanks…' : '✨ Fill blanks with AI'}
        </button>
        <button class="m-btn copy" type="button" onclick={copyExport}>
          {copied ? '✓ Copied' : 'Copy JSON'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .projects-page { display: flex; flex-direction: column; gap: 1.75rem; }

  /* ── Header ─────────────────────────────────── */
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .seed-link {
    background: transparent;
    border: 1px solid var(--text-muted);
    color: var(--text-muted);
    padding: 0.55rem 1.25rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .seed-link:hover { color: var(--text); border-color: var(--text); }

  /* Button variant of .seed-link (Export All) */
  button.seed-link { cursor: pointer; line-height: 1.2; }

  .add-btn {
    background: var(--accent);
    color: #fff;
    padding: 0.55rem 1.25rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .add-btn:hover { opacity: 0.88; }

  /* ── Filters ────────────────────────────────── */
  .filters {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .select-wrap { position: relative; }

  .cat-select {
    appearance: none;
    background: var(--bg);
    border: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.45rem 2.25rem 0.45rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .cat-select:focus { border-color: var(--accent); }

  .select-arrow {
    position: absolute;
    right: 0.65rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .tag-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }

  .tag-btn {
    background: var(--bg-card);
    color: var(--text-muted);
    border: 1px solid transparent;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .tag-btn:hover  { color: var(--text); }
  .tag-btn.active { background: var(--accent); color: #fff; }

  .search-input {
    margin-left: auto;
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.45rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    outline: none;
    width: 220px;
    transition: border-color 0.2s ease;
  }

  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-muted); opacity: 0.6; }
  .search-input::-webkit-search-cancel-button { display: none; }

  /* ── Export modal ───────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 1000;
  }

  .modal {
    background: var(--bg);
    border: 1px solid var(--bg-card);
    width: 100%;
    max-width: 640px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.5rem;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .modal-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
  }

  .modal-close:hover { color: var(--text); }

  .modal-sub {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .modal-error {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: #e53e3e;
    border: 1px solid #e53e3e;
    padding: 0.5rem 0.7rem;
  }

  .modal-json {
    flex: 1;
    min-height: 260px;
    resize: vertical;
    background: var(--bg-card);
    border: 1px solid var(--bg-card);
    color: var(--text);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    line-height: 1.5;
    padding: 0.875rem;
    outline: none;
    white-space: pre;
    overflow: auto;
  }

  .modal-actions {
    display: flex;
    gap: 0.625rem;
    justify-content: flex-end;
  }

  .m-btn {
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.55rem 1.1rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.2s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .m-btn.ai {
    background: transparent;
    border-color: var(--accent);
    color: var(--accent);
  }

  .m-btn.ai:hover:not(:disabled) { background: var(--accent); color: #fff; }
  .m-btn.ai:disabled { opacity: 0.55; cursor: wait; }

  .m-btn.copy {
    background: var(--accent);
    color: #fff;
  }

  .m-btn.copy:hover { opacity: 0.88; }

  /* ── Project list ───────────────────────────── */
  .project-list { display: flex; flex-direction: column; }

  .p-row {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    align-items: center;
    gap: 1.25rem;
    padding: 0.875rem 0;
    border-bottom: 1px solid var(--bg-card);
  }

  .thumb {
    width: 80px;
    height: 45px;
    background: var(--bg-card);
    overflow: hidden;
    flex-shrink: 0;
  }

  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .p-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }

  .p-title-row { display: flex; align-items: center; gap: 0.6rem; }

  .p-title {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .p-meta {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: capitalize;
  }

  /* Badges */
  .badge {
    font-family: var(--font-body);
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.45rem;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .badge.draft          { background: var(--bg-card); color: var(--text-muted); }
  .badge.live           { background: #d1fae5; color: #065f46; }
  .badge.in-progress    { background: #fef3c7; color: #92400e; }
  .badge.case-study     { background: #ede9fe; color: #5b21b6; }

  /* Actions */
  .p-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

  .act {
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.75rem;
    padding: 0.28rem 0.7rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  }

  .act.edit:hover       { color: var(--text); border-color: var(--text-muted); }
  .act.delete:hover     { color: #e53e3e; border-color: #e53e3e; }
  .act.confirm-del      { background: #e53e3e; color: #fff; border-color: #e53e3e; }
  .act.cancel:hover     { color: var(--text); border-color: var(--text-muted); }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .page-header { flex-wrap: wrap; gap: 0.5rem; }
    .header-actions { flex-wrap: wrap; }
    .p-row { grid-template-columns: 60px 1fr; row-gap: 0.5rem; }
    .p-actions { grid-column: 1 / -1; justify-content: flex-end; }
    .thumb { width: 60px; height: 34px; }
  }

  @media (max-width: 480px) {
    .p-row { grid-template-columns: 1fr; }
    .thumb { display: none; }
    .p-actions { grid-column: 1; }
  }
</style>
