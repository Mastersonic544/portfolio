<script>
  import { onMount } from 'svelte';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { activeCategory, activeTag } from '$lib/stores/projects.js';
  import { categoriesFor, loadCategories, DEFAULT_CATEGORIES } from '$lib/categories.js';
  import { logClick } from '$lib/utils/analytics.js';
  import ProjectCard from '$lib/components/public/ProjectCard.svelte';
  import ProjectExpand from '$lib/components/public/ProjectExpand.svelte';

  const validCategories = new Set(['dev', 'digital', 'pfe']);

  // Editable taxonomy (Firestore-backed); defaults render until it loads.
  let taxonomy = $state(DEFAULT_CATEGORIES);

  /** @type {any[]} */
  let allProjects = $state([]);
  let loading     = $state(true);
  let search      = $state('');
  let cat         = $state('');
  let tag         = $state('');

  let filtered = $derived(
    allProjects.filter((p) => {
      const catOk    = !cat || p.category === cat;
      const tagOk    = !tag || (p.tags ?? []).includes(tag);
      const searchOk = !search.trim() || p.title?.toLowerCase().includes(search.trim().toLowerCase());
      return catOk && tagOk && searchOk && p.published !== false;
    })
  );

  // Sub-category options for the second dropdown, narrowed to the categories
  // actually present on the loaded projects so we never show an empty filter.
  let currentCats = $derived(
    categoriesFor(taxonomy, cat).filter((c) =>
      allProjects.some((p) => (cat ? p.category === cat : true) && (p.tags ?? []).includes(c))
    )
  );

  /** @type {HTMLElement | null} */
  let carouselEl = $state(null);

  /** @type {any} */
  let selectedProject = $state(null);
  let expandOpen = $state(false);

  const CARD_W = 316; // card width (290px) + gap (1.25rem ≈ 20px) + a few px

  function scrollPrev() { carouselEl?.scrollBy({ left: -CARD_W, behavior: 'smooth' }); }
  function scrollNext() { carouselEl?.scrollBy({ left:  CARD_W, behavior: 'smooth' }); }

  /** @param {any} project */
  function handleOpen(project) {
    selectedProject = project;
    expandOpen = true;
    window.location.hash = project.slug;
  }

  function handleClose() {
    expandOpen = false;
    selectedProject = null;
    history.pushState('', '', window.location.pathname + window.location.search);
  }

  /** @param {Event & { currentTarget: HTMLSelectElement }} e */
  function onCategoryChange(e) {
    activeCategory.set(e.currentTarget.value);
    activeTag.set('');
  }

  /** @param {Event & { currentTarget: HTMLSelectElement }} e */
  function onTagChange(e) {
    activeTag.set(e.currentTarget.value);
  }

  onMount(async () => {
    logClick('projects');

    loadCategories().then((t) => { taxonomy = t; });

    const unsubCat = activeCategory.subscribe((v) => { cat = v; });
    const unsubTag = activeTag.subscribe((v)  => { tag = v; });

    // Pre-apply ?category= query param
    const params = new URLSearchParams(window.location.search);
    const qCat   = params.get('category');
    if (qCat && validCategories.has(qCat)) activeCategory.set(qCat);

    try {
      const snap  = await getDocs(collection(db, 'projects'));
      allProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (_) { /* show empty */ }

    loading = false;

    // Deep-link via hash
    const hash = window.location.hash.slice(1);
    if (hash) {
      const match = allProjects.find((p) => p.slug === hash);
      if (match) { selectedProject = match; expandOpen = true; }
    }

    return () => { unsubCat(); unsubTag(); };
  });
</script>

<section class="projects" id="projects">
  <span class="section-label">Work</span>
  <h2 class="section-title">Discover My Work</h2>

  <!-- Filter bar -->
  <div class="filters">
    <div class="select-wrap">
      <select class="category-select" value={cat} onchange={onCategoryChange}>
        <option value="">All Types</option>
        <option value="digital">Digital</option>
        <option value="dev">Dev</option>
        <option value="pfe">Academic</option>
      </select>
      <span class="select-arrow">▾</span>
    </div>

    <div class="select-wrap">
      <select class="category-select" value={tag} onchange={onTagChange} disabled={currentCats.length === 0}>
        <option value="">All Categories</option>
        {#each currentCats as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
      <span class="select-arrow">▾</span>
    </div>

    <div class="search-wrap">
      <input
        class="search-input"
        type="search"
        placeholder="Search projects…"
        bind:value={search}
      />
    </div>
  </div>

  <!-- Carousel -->
  {#if loading}
    <p class="hint">Loading projects…</p>
  {:else if filtered.length === 0}
    <div class="empty-state">
      <span>No projects match this filter.</span>
    </div>
  {:else}
    <div class="carousel-outer">
      <button class="nav-btn" onclick={scrollPrev} aria-label="Previous">&#8249;</button>

      <div class="carousel" bind:this={carouselEl}>
        {#each filtered as project (project.id)}
          <div class="carousel-item">
            <ProjectCard {project} onopen={handleOpen} />
          </div>
        {/each}
      </div>

      <button class="nav-btn" onclick={scrollNext} aria-label="Next">&#8250;</button>
    </div>

    <p class="count-hint">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
  {/if}
</section>

<ProjectExpand project={selectedProject} open={expandOpen} onclose={handleClose} />

<style>
  .projects {
    padding: 7rem 5vw 6rem;
    background-color: var(--bg);
    color: var(--text);
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  .section-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 2.5rem;
  }

  /* ── Filter bar ─────────────────────────────── */
  .filters {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  /* Category select */
  .select-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .category-select {
    appearance: none;
    -webkit-appearance: none;
    background: var(--bg);
    border: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.45rem 2rem 0.45rem 0.875rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 0;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .category-select:focus { border-color: var(--accent); }

  .select-arrow {
    position: absolute;
    right: 0.65rem;
    pointer-events: none;
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .category-select:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Search — pushed to the right of the filter bar */
  .search-wrap { flex-shrink: 0; margin-left: auto; }

  .search-input {
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.45rem 0.875rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    outline: none;
    width: 200px;
    transition: border-color 0.2s ease;
  }

  .search-input:focus { border-color: var(--accent); }

  .search-input::placeholder { color: var(--text-muted); opacity: 0.6; }

  /* Hide browser's native search cancel button */
  .search-input::-webkit-search-cancel-button { display: none; }

  /* ── Carousel ───────────────────────────────── */
  .carousel-outer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .carousel {
    flex: 1;
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    padding-bottom: 0.75rem;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .carousel::-webkit-scrollbar { display: none; }

  .carousel-item {
    flex-shrink: 0;
    width: 290px;
    scroll-snap-align: start;
  }

  /* Nav buttons */
  .nav-btn {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1px solid var(--bg-card);
    color: var(--text);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    align-self: center;
  }

  .nav-btn:hover { background: var(--text-muted); color: var(--bg); border-color: var(--text-muted); }

  /* Count hint */
  .count-hint {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-top: 1rem;
    letter-spacing: 0.04em;
  }

  /* ── Empty / Loading ────────────────────────── */
  .hint {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .empty-state {
    min-height: 20vh;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--bg-card);
  }

  .empty-state span {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 768px) {
    .projects { padding: 5rem 1.5rem 4rem; }

    .filters { flex-direction: column; align-items: flex-start; gap: 0.75rem; }

    .search-wrap { width: 100%; }
    .search-input { width: 100%; box-sizing: border-box; }

    .carousel-item { width: 260px; }

    .nav-btn { display: none; }
  }

  @media (max-width: 480px) {
    .projects { padding: 4rem 16px 3rem; }
    .carousel-item { width: min(260px, 80vw); }
  }
</style>
