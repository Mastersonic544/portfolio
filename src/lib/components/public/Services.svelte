<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { activeCategory } from '$lib/stores/projects.js';
  import { logClick } from '$lib/utils/analytics.js';

  /** @type {{ title: string; desc: string; services: string[]; category: string }[]} */
  let cards  = $state([]);
  let loaded = $state(false);

  onMount(async () => {
    logClick('services');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'services'), limit(1))
      );
      if (!snap.empty) {
        cards = snap.docs[0].data().cards ?? [];
      }
    } catch (_) {}
    loaded = true;
  });

  /** @param {{ category: string }} filter */
  function handleCardClick(filter) {
    activeCategory.set(filter.category);
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

{#if loaded && cards.length}
<section class="services" id="services">
  <span class="section-label">Services</span>
  <h2 class="section-title">What I Do</h2>

  <div class="card-grid">
    {#each cards as card}
      <button class="card" onclick={() => handleCardClick({ category: card.category })}>
        <h3 class="card-title">{card.title}</h3>
        <p class="card-desc">{card.desc}</p>
        <ul class="service-list">
          {#each card.services as svc}
            <li>{svc}</li>
          {/each}
        </ul>
        <span class="card-cta">View Projects →</span>
      </button>
    {/each}
  </div>
</section>
{/if}

<style>
  .services { padding: 7rem 5vw 5rem; background-color: var(--bg-card); color: var(--text); transition: background-color 0.35s ease, color 0.35s ease; }

  .section-label { display: block; font-family: var(--font-body); font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 0.75rem; }

  .section-title { font-family: var(--font-heading); font-size: clamp(1.5rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.03em; color: var(--text); margin-bottom: 3rem; }

  .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

  .card { background: var(--bg); border: 1px solid transparent; padding: 2rem; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 1rem; transition: border-color 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .card:hover { border-color: var(--accent); transform: translateY(-4px); }

  .card-title { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text); }

  .card-desc { font-family: var(--font-body); font-size: 0.875rem; line-height: 1.7; color: var(--text-muted); flex: 1; }

  .service-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }

  .service-list li { font-family: var(--font-body); font-size: 0.78rem; font-weight: 500; color: var(--text-muted); padding-left: 0.875rem; position: relative; }
  .service-list li::before { content: '—'; position: absolute; left: 0; color: var(--accent); font-size: 0.65rem; top: 0.1em; }

  .card-cta { font-family: var(--font-body); font-size: 0.78rem; font-weight: 600; color: var(--accent); letter-spacing: 0.02em; margin-top: auto; }

  @media (max-width: 900px) {
    .services { padding: 5rem 24px 4rem; }
    .card-grid { grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); }
  }

  @media (max-width: 480px) {
    .services { padding: 4rem 16px 3rem; }
    .card-grid { grid-template-columns: 1fr; }
  }
</style>
