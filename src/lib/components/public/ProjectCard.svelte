<script>
  import { thumb } from '$lib/utils/images.js';

  /** @type {{ project: import('$lib/stores/projects.js').Project, onopen?: (p: import('$lib/stores/projects.js').Project) => void }} */
  let { project, onopen } = $props();

  const statusClass = {
    'Live':        'live',
    'In Progress': 'progress',
    'Case Study':  'case'
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
  class="card"
  tabindex="0"
  onclick={() => onopen?.(project)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onopen?.(project)}
>
  <div class="thumbnail">
    <img src={project.thumbUrl || thumb(project.slug ?? project.id)} alt={project.title} loading="lazy" />
  </div>

  <div class="body">
    <div class="meta">
      <span class="status {statusClass[project.status] ?? 'case'}">{project.status}</span>
      {#if project.client || project.year}
        <span class="info">{[project.client, project.year].filter(Boolean).join(' · ')}</span>
      {/if}
    </div>

    <h3 class="title">{project.title}</h3>
    <p class="description">{project.description}</p>

    <div class="tags">
      {#each project.tags.slice(0, 4) as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>

    <span class="project-arrow">
      {project.status === 'Live' ? 'See it live' : project.status === 'Case Study' ? 'Read case study' : 'Read details'} →
    </span>
  </div>
</article>

<style>
  .card {
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    display: flex;
    flex-direction: column;
    transition:
      border-color 0.25s ease,
      transform 0.25s ease;
  }

  .card:hover,
  .card:focus-visible {
    border-color: var(--accent);
    transform: translateY(-4px);
  }

  /* ── Thumbnail ───────────────────────────────── */
  .thumbnail {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-bottom: 0.5px solid var(--border);
    background:
      repeating-linear-gradient(
        135deg,
        var(--bg-card) 0,
        var(--bg-card) 11px,
        var(--bg-card-hover) 11px,
        var(--bg-card-hover) 12px
      );
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
    padding: 28px 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .info {
    color: var(--text-muted);
  }

  /* ── Status badge ────────────────────────────── */
  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .status.live {
    color: var(--accent);
  }
  .status.live::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }
  .status.progress,
  .status.case {
    color: var(--text-muted);
  }

  /* ── Title ───────────────────────────────────── */
  .title {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.15;
    color: var(--text);
    margin: 0;
  }

  /* ── Description ─────────────────────────────── */
  .description {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted);
    margin: 0;
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
    gap: 8px;
    margin-top: 4px;
  }

  .tag {
    display: inline-block;
    background: var(--bg);
    color: var(--text);
    padding: 5px 12px;
    border-radius: 3px;
    border: 0.5px solid var(--border);
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  /* ── Project Arrow ────────────────────────────── */
  .project-arrow {
    margin-top: 8px;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s ease, gap 0.2s ease;
  }

  .card:hover .project-arrow {
    color: var(--accent);
    gap: 14px;
  }
</style>
