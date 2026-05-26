<script>
  import { onMount } from 'svelte';
  import { activeCategory } from '$lib/stores/projects.js';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('services'));

  const cards = [
    {
      title: 'Digital',
      desc: 'Video editing, graphic design, logo creation, and visual storytelling.',
      services: ['Video Editing', 'Graphic Design', 'Logo Creation'],
      filter: { category: 'digital' }
    },
    {
      title: 'Dev',
      desc: 'Web apps, IoT systems, automation tools, and everything in between.',
      services: ['Web Development', 'IoT', 'Automation'],
      filter: { category: 'dev' }
    },
    {
      title: 'Academic Consulting',
      desc: 'PFE support, thesis writing, project reports, and academic guidance.',
      services: ['PFE Projects', 'Thesis Support', 'Reports'],
      filter: { category: 'pfe' }
    }
  ];

  /** @param {{ category: string }} filter */
  function handleCardClick(filter) {
    activeCategory.set(filter.category);
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<section class="services" id="services">
  <span class="section-label">Services</span>
  <h2 class="section-title">What I Do</h2>

  <div class="cards">
    {#each cards as card}
      <div
        class="card"
        role="button"
        tabindex="0"
        onclick={() => handleCardClick(card.filter)}
        onkeydown={(e) => e.key === 'Enter' && handleCardClick(card.filter)}
      >
        <h3 class="card-title">{card.title}</h3>
        <p class="card-desc">{card.desc}</p>
        <ul class="service-list">
          {#each card.services as service}
            <li>{service}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  .services {
    padding: 7rem 5vw 5rem;
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
    margin-bottom: 3rem;
  }

  /* ── Cards grid ────────────────────────────── */
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    /* 1px gap creates a hairline divider effect between cards */
    background-color: var(--bg-card);
    border: 1px solid var(--bg-card);
  }

  .card {
    padding: 2.25rem 2rem;
    background: var(--bg);
    cursor: pointer;
    text-align: left;
    border: none;
    outline: none;
    transition:
      background-color 0.35s ease,
      outline-color 0.2s ease;
    position: relative;
  }

  .card:hover,
  .card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    z-index: 1;
  }

  /* ── Card content ──────────────────────────── */
  .card-title {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 2.5vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    color: var(--text);
    line-height: 1;
    margin-bottom: 1rem;
  }

  .card-desc {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--text-muted);
    margin-bottom: 1.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .service-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .service-list li {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
    padding-left: 1rem;
    position: relative;
  }

  .service-list li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  /* ── Mobile ────────────────────────────────── */
  @media (max-width: 768px) {
    .services {
      padding: 5rem 1.5rem 3rem;
    }

    .cards {
      grid-template-columns: 1fr;
    }

    .card-title {
      font-size: 1.75rem;
    }
  }
</style>
