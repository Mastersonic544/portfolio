<script>
  import { tick } from 'svelte';
  import { animate } from 'motion';
  import { marked } from 'marked';
  import { thumb } from '$lib/utils/images.js';

  /**
   * @type {{
   *   project: import('$lib/stores/projects.js').Project | null,
   *   open: boolean,
   *   onclose?: () => void
   * }}
   */
  let { project, open, onclose } = $props();

  /** @type {HTMLElement | null} */
  let modalEl = $state(null);

  // Resolves the external showcase link for digital (Behance) and academic (document) work
  let showcase = $derived.by(() => {
    if (!project) return null;
    if (project.category === 'digital' && project.links?.behance) {
      return { url: project.links.behance, label: project.links.behanceLabel || 'Behance' };
    }
    if (project.category === 'pfe' && project.links?.document) {
      return { url: project.links.document, label: project.links.documentLabel || 'View PDF' };
    }
    return null;
  });

  // Animate modal in when it opens; lock body scroll
  $effect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    tick().then(() => {
      if (modalEl) {
        animate(
          modalEl,
          { scale: [0.92, 1], opacity: [0, 1] },
          { duration: 0.3, easing: [0.22, 1, 0.36, 1] }
        );
      }
    });
    return () => { document.body.style.overflow = ''; };
  });

  // Close on Escape key
  $effect(() => {
    if (!open) return;
    /** @param {KeyboardEvent} e */
    const handler = (e) => { if (e.key === 'Escape') onclose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  /** @param {MouseEvent} e */
  function onBackdropClick(e) {
    if (e.target === e.currentTarget) onclose?.();
  }

  /** @returns {string} */
  function renderArticle(/** @type {string} */ md) {
    return /** @type {string} */ (marked.parse(md, { async: false }));
  }
</script>

{#if open && project}
  <!-- Backdrop -->
  <div class="backdrop" onclick={onBackdropClick} onkeydown={(e) => e.key === 'Escape' && onclose?.()} role="dialog" aria-modal="true" aria-label={project.title} tabindex="-1">

    <!-- Modal -->
    <div class="modal" bind:this={modalEl}>

      <!-- Close -->
      <button class="close" onclick={() => onclose?.()} aria-label="Close">✕</button>

      <!-- Hero image -->
      <div class="hero-img" class:digital={project.category === 'digital'}>
        <img src={project.thumbUrl || thumb(project.slug ?? project.id)} alt={project.title} />
      </div>

      <div class="modal-body">

        <!-- Header -->
        <div class="modal-header">
          <div class="header-badges">
            <span class="cat-badge">{project.category}</span>
            <span class="status-text">{project.status}</span>
          </div>
          <h2 class="modal-title">{project.title}</h2>
        </div>

        <!-- KPIs -->
        {#if project.kpis?.length}
          <div class="kpis">
            {#each project.kpis as kpi}
              <div class="kpi">
                <span class="kpi-value">{kpi.value}</span>
                <span class="kpi-label">{kpi.label}</span>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Summary -->
        <p class="summary">{project.description}</p>

        <!-- Stack card — dev projects only -->
        {#if project.category === 'dev' && project.stack?.length}
          <div class="stack-card">
            <span class="stack-label">Stack</span>
            <div class="stack-tags">
              {#each project.stack as tech}
                <span class="stack-tag">{tech}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Showcase card — digital (Behance/gallery) & academic (PDF/docs) work -->
        {#if showcase || project.showcaseNote}
          <div class="showcase-card">
            {#if project.showcaseNote}
              <p class="showcase-note">{project.showcaseNote}</p>
            {/if}
            {#if showcase}
              <a href={showcase.url} class="link-btn preview-btn showcase-btn" target="_blank" rel="noopener noreferrer">
                {showcase.label} →
              </a>
            {/if}
          </div>
        {/if}

        <!-- Links -->
        {#if project.links?.github || project.links?.demo || project.links?.loom || project.links?.preview}
          <div class="links">
            {#if project.links.preview}
              <a href={project.links.preview} class="link-btn preview-btn" target="_blank" rel="noopener noreferrer">
                {project.links.previewLabel || 'Visit Platform'}
              </a>
            {/if}
            {#if project.links.github}
              <a href={project.links.github} class="link-btn" target="_blank" rel="noopener noreferrer">GitHub</a>
            {/if}
            {#if project.links.demo}
              <a href={project.links.demo} class="link-btn" target="_blank" rel="noopener noreferrer">Live Demo</a>
            {/if}
            {#if project.links.loom}
              <a href={project.links.loom} class="link-btn" target="_blank" rel="noopener noreferrer">Loom</a>
            {/if}
          </div>
        {/if}

        <!-- Article body -->
        {#if project.article}
          <div class="article">
            {@html renderArticle(project.article)}
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Backdrop ────────────────────────────────── */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    z-index: 400;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem 1rem 4rem;
    overflow-y: auto;
    animation: backdrop-in 0.2s ease both;
  }

  @keyframes backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Modal ───────────────────────────────────── */
  .modal {
    position: relative;
    background: var(--bg);
    width: 100%;
    max-width: 800px;
    border-radius: 4px;
    overflow: hidden;
    margin: auto;
    /* initial state for Motion One animation */
    opacity: 0;
  }

  /* ── Close button ────────────────────────────── */
  .close {
    position: absolute;
    top: 0.875rem;
    right: 0.875rem;
    z-index: 10;
    background: rgba(0, 0, 0, 0.45);
    border: none;
    color: #fff;
    font-size: 0.9rem;
    line-height: 1;
    padding: 0.3rem 0.45rem;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.15s ease;
  }

  .close:hover {
    background: rgba(0, 0, 0, 0.75);
  }

  /* ── Hero image ──────────────────────────────── */
  .hero-img {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--bg-card);
  }

  .hero-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Digital work: show the full graphic (logo, brand board) without cropping */
  .hero-img.digital {
    aspect-ratio: auto;
    max-height: 70vh;
    padding: 1.25rem;
    box-sizing: border-box;
  }

  .hero-img.digital img {
    object-fit: contain;
    max-height: calc(70vh - 2.5rem);
  }

  /* ── Modal body padding ──────────────────────── */
  .modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  /* ── Header ──────────────────────────────────── */
  .modal-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-badges {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cat-badge {
    display: inline-block;
    background: var(--bg-card);
    color: var(--text-muted);
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .status-text {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--text);
  }

  /* ── KPIs row ────────────────────────────────── */
  .kpis {
    display: flex;
    gap: 2.5rem;
    flex-wrap: wrap;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--bg-card);
  }

  .kpi {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .kpi-value {
    font-family: var(--font-heading);
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--text);
  }

  .kpi-label {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  /* ── Summary ─────────────────────────────────── */
  .summary {
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.75;
    color: var(--text-muted);
  }

  /* ── Stack card ──────────────────────────────── */
  .stack-card {
    border: 1px solid var(--bg-card);
    padding: 1rem 1.125rem;
  }

  .stack-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .stack-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .stack-tag {
    display: inline-block;
    background: var(--bg-card);
    color: var(--text);
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* ── Showcase card (digital) ─────────────────── */
  .showcase-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    border: 1px solid var(--bg-card);
    border-left: 3px solid var(--accent);
    padding: 1.25rem 1.375rem;
    border-radius: 4px;
  }

  .showcase-note {
    font-family: var(--font-body);
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--text-muted);
    margin: 0;
  }

  .showcase-btn { letter-spacing: 0.02em; }

  /* ── Links ───────────────────────────────────── */
  .links {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--accent);
    color: var(--accent);
    background: transparent;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }

  .link-btn:hover {
    background: var(--accent);
    color: #fff;
  }

  .link-btn.preview-btn {
    background: var(--accent);
    color: #fff;
  }

  .link-btn.preview-btn:hover {
    background: transparent;
    color: var(--accent);
  }

  /* ── Article markdown ────────────────────────── */
  .article {
    font-family: var(--font-body);
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--text-muted);
    padding-top: 1.5rem;
    border-top: 1px solid var(--bg-card);
  }

  .article :global(h2),
  .article :global(h3) {
    font-family: var(--font-heading);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 0.6rem;
  }

  .article :global(h2) { font-size: 1.2rem; margin-top: 1.75rem; }
  .article :global(h3) { font-size: 1rem;   margin-top: 1.25rem; }

  .article :global(p)  { margin-bottom: 1rem; }
  .article :global(ul),
  .article :global(ol) { padding-left: 1.25rem; margin-bottom: 1rem; }
  .article :global(li) { margin-bottom: 0.3rem; }
  .article :global(a)  { color: var(--accent); text-underline-offset: 3px; }
  .article :global(code) {
    background: var(--bg-card);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
  .article :global(pre) {
    background: var(--bg-card);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  /* ── Mobile ──────────────────────────────────── */
  @media (max-width: 600px) {
    .backdrop {
      padding: 0;
      align-items: flex-end;
    }

    .modal {
      border-radius: 12px 12px 0 0;
      max-height: 92dvh;
      overflow-y: auto;
    }

    .modal-body {
      padding: 1.5rem;
      gap: 1.5rem;
    }

    .kpis {
      gap: 1.5rem;
    }

    .kpi-value {
      font-size: 1.75rem;
    }
  }
</style>
