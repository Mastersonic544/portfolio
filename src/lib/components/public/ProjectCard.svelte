<script>
  import { thumb } from '$lib/utils/images.js';

  /** @type {{ project: import('$lib/stores/projects.js').Project, onopen?: (p: import('$lib/stores/projects.js').Project) => void }} */
  let { project, onopen } = $props();

  const statusClass = {
    'Live':        'live',
    'In Progress': 'in-progress',
    'Case Study':  'case-study'
  };
</script>

<article
  class="card"
  role="button"
  tabindex="0"
  onclick={() => onopen?.(project)}
  onkeydown={(e) => e.key === 'Enter' && onopen?.(project)}
>
  <div class="thumbnail">
    <img src={thumb(project.id)} alt={project.title} loading="lazy" />
  </div>

  <div class="body">
    <div class="meta">
      <span class="status {statusClass[project.status] ?? 'case-study'}">{project.status}</span>
    </div>

    <h3 class="title">{project.title}</h3>
    <p class="description">{project.description}</p>

    <div class="tags">
      {#each project.tags.slice(0, 4) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </div>
</article>

<style>
  .card {
    background: var(--bg-card);
    border: 1px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    display: flex;
    flex-direction: column;
    transition:
      border-color 0.2s ease,
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card:hover,
  .card:focus-visible {
    border-color: var(--accent);
    transform: translateY(-4px);
  }

  /* ── Thumbnail ───────────────────────────────── */
  .thumbnail {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--bg);
    flex-shrink: 0;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  .card:hover .thumbnail img {
    transform: scale(1.04);
  }

  /* ── Body ────────────────────────────────────── */
  .body {
    padding: 1.125rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* ── Status badge ────────────────────────────── */
  .status {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    background: var(--bg);
    padding: 0.18rem 0.45rem;
    border-radius: 3px;
  }

  .status.live        { color: var(--accent); }
  .status.in-progress { color: var(--text-muted); }
  .status.case-study  { color: var(--text-muted); }

  /* ── Title ───────────────────────────────────── */
  .title {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--text);
  }

  /* ── Description ─────────────────────────────── */
  .description {
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  /* ── Tags ────────────────────────────────────── */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.25rem;
  }

  .tag {
    display: inline-block;
    background: var(--bg);
    color: var(--text);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 500;
  }
</style>
