<script>
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { activeCategory, activeTag } from '$lib/stores/projects.js';
  import { logClick } from '$lib/utils/analytics.js';
  import ProjectCard from '$lib/components/public/ProjectCard.svelte';
  import ProjectExpand from '$lib/components/public/ProjectExpand.svelte';

  /** @typedef {import('$lib/stores/projects.js').Project} Project */

  /** @type {Record<string, string[]>} */
  const tagsByCategory = {
    '':      ['SvelteKit', 'React', 'Python', 'IoT', 'Video', 'Figma', 'Firebase', 'Arduino'],
    digital: ['Video Editing', 'Graphic Design', 'Motion', 'Branding', 'Logo', 'After Effects'],
    dev:     ['SvelteKit', 'React', 'Python', 'Node.js', 'IoT', 'Arduino', 'Firebase', 'ESP32'],
    pfe:     ['PFE', 'Thesis', 'Reports', 'Academic', 'Machine Learning', 'Networks']
  };

  const validCategories = new Set(Object.keys(tagsByCategory).filter(Boolean));

  /** @type {Project[]} */
  const mockProjects = [
    {
      id: 'shifters-2024',
      title: 'Shifters Hackathon Platform',
      slug: 'shifters-hackathon',
      category: 'dev',
      tags: ['SvelteKit', 'Firebase', 'Node.js', 'Firestore'],
      description:
        'A full-stack hackathon management platform built for the Shifters community. Handles team registration, project submissions, and live leaderboards.',
      imageCount: 4,
      kpis: [
        { label: 'Teams',       value: '48' },
        { label: 'Submissions', value: '32' },
        { label: 'Built in',    value: '72h' }
      ],
      status: 'Live',
      stack: ['SvelteKit', 'Firebase', 'Firestore', 'Node.js', 'Vercel'],
      links: { github: '#', demo: '#' },
      article:
        "## Overview\n\nBuilt for the Shifters hackathon in Sfax, this platform handled registration, judging, and live results for 48 competing teams.\n\n## Key Decisions\n\nFirestore real-time listeners drove the leaderboard — no polling, no WebSockets. Every judge's score propagated in under 300 ms."
    },
    {
      id: 'enet-brand',
      title: "ENET'Com Brand Identity",
      slug: 'enet-brand',
      category: 'digital',
      tags: ['Figma', 'Branding', 'Motion', 'Logo'],
      description:
        "Complete brand identity redesign for ENET'Com engineering school. Includes logo system, motion templates, and visual guidelines.",
      imageCount: 6,
      kpis: [
        { label: 'Assets',     value: '120+' },
        { label: 'Guidelines', value: '42 pp.' },
        { label: 'Delivery',   value: '3 wks' }
      ],
      status: 'Case Study',
      stack: [],
      links: { loom: '#' },
      article:
        "## The Challenge\n\nENET'Com needed a modern identity that would work for students, faculty, and industry partners simultaneously.\n\n## Outcome\n\nA modular logo system with 6 lockups, a motion language for social content, and a 42-page brand book with grid system and typography scale."
    },
    {
      id: 'iot-greenhouse',
      title: 'Smart Greenhouse System',
      slug: 'iot-greenhouse',
      category: 'pfe',
      tags: ['IoT', 'ESP32', 'Python', 'Firebase', 'Arduino'],
      description:
        'Final-year engineering project — an autonomous greenhouse monitoring system with real-time sensor data, alerts, and remote control via mobile app.',
      imageCount: 5,
      kpis: [
        { label: 'Sensors',  value: '8' },
        { label: 'Uptime',   value: '99.2%' },
        { label: 'Response', value: '<200ms' }
      ],
      status: 'In Progress',
      stack: ['ESP32', 'MicroPython', 'Firebase RTDB', 'Flutter', 'Node.js'],
      links: { github: '#' },
      article:
        '## Motivation\n\nSmart agriculture is transforming food production across North Africa. This PFE project explores automated monitoring and response at low cost.\n\n## Architecture\n\nESP32 sensors push to Firebase RTDB every 5 s. A Flutter mobile app renders live charts and sends push notifications when thresholds are crossed.'
    }
  ];

  const currentTags = derived(
    activeCategory,
    ($cat) => tagsByCategory[$cat] ?? tagsByCategory['']
  );

  const filteredProjects = derived(
    [activeCategory, activeTag],
    ([$cat, $tag]) =>
      mockProjects.filter((p) => {
        const catMatch = !$cat || p.category === $cat;
        const tagMatch = !$tag || p.tags.includes($tag);
        return catMatch && tagMatch;
      })
  );

  /** @type {Project | null} */
  let selectedProject = $state(null);
  let expandOpen = $state(false);

  /** @param {Project} project */
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

  /** @param {string} tag */
  function toggleTag(tag) {
    activeTag.update((t) => (t === tag ? '' : tag));
  }

  onMount(() => {
    logClick('projects');
    // Pre-apply ?category= query param
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && validCategories.has(cat)) activeCategory.set(cat);

    // Deep-link to a project via URL hash (#slug)
    const hash = window.location.hash.slice(1);
    if (hash) {
      const project = mockProjects.find((p) => p.slug === hash);
      if (project) {
        selectedProject = project;
        expandOpen = true;
      }
    }
  });
</script>

<section class="projects" id="projects">
  <span class="section-label">Work</span>
  <h2 class="section-title">Discover My Work</h2>

  <!-- Filters bar -->
  <div class="filters">
    <div class="select-wrap">
      <select class="category-select" value={$activeCategory} onchange={onCategoryChange}>
        <option value="">All</option>
        <option value="digital">Digital</option>
        <option value="dev">Dev</option>
        <option value="pfe">Academic</option>
      </select>
    </div>

    <div class="tag-row">
      {#each $currentTags as tag}
        <button
          class="tag-btn"
          class:active={$activeTag === tag}
          onclick={() => toggleTag(tag)}
        >{tag}</button>
      {/each}
    </div>
  </div>

  <!-- Project grid -->
  {#if $filteredProjects.length > 0}
    <div class="project-grid">
      {#each $filteredProjects as project (project.id)}
        <ProjectCard {project} onopen={handleOpen} />
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <span>No projects match this filter.</span>
    </div>
  {/if}
</section>

<!-- Expand modal — always mounted, shown/hidden internally -->
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
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 2.5rem;
  }

  /* ── Filters bar ───────────────────────────── */
  .filters {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .select-wrap {
    position: relative;
    display: inline-block;
    flex-shrink: 0;
  }

  .select-wrap::after {
    content: '▾';
    position: absolute;
    right: 0.65rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    font-size: 0.7rem;
    line-height: 1;
  }

  .category-select {
    appearance: none;
    -webkit-appearance: none;
    background: var(--bg);
    border: 1px solid var(--bg-card);
    color: var(--text);
    padding: 0.5rem 2rem 0.5rem 0.875rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 0;
    transition: border-color 0.2s ease;
  }

  .category-select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-btn {
    background: var(--bg-card);
    color: var(--text-muted);
    border: 1px solid transparent;
    padding: 0.3rem 0.65rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  }

  .tag-btn:hover { color: var(--text); border-color: var(--bg-card); }
  .tag-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  /* ── Project grid ──────────────────────────── */
  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  /* ── Empty state ───────────────────────────── */
  .empty-state {
    min-height: 25vh;
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

  /* ── Responsive ────────────────────────────── */
  @media (max-width: 1024px) {
    .project-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .projects { padding: 5rem 1.5rem 4rem; }
    .filters { flex-direction: column; align-items: flex-start; gap: 0.875rem; }
    .select-wrap, .category-select { width: 100%; }
    .project-grid { grid-template-columns: 1fr; }
  }
</style>
