<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { db } from '$lib/firebase.js';
  import { categoriesFor } from '$lib/categories.js';

  /** @type {any[]} */
  let allProjects = $state([]);
  let loading     = $state(true);

  let activeCategory = $state('');
  let activeTag      = $state('');

  /** @type {string | null} */
  let confirmDelete  = $state(null);

  let currentTags = $derived(categoriesFor(activeCategory));

  let filtered = $derived(
    allProjects.filter((p) => {
      const catOk = !activeCategory || p.category === activeCategory;
      const tagOk = !activeTag      || p.tags?.includes(activeTag);
      return catOk && tagOk;
    })
  );

  onMount(async () => {
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
