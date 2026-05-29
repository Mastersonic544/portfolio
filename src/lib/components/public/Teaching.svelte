<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { activeCategory } from '$lib/stores/projects.js';
  import { logClick } from '$lib/utils/analytics.js';

  let heading     = $state('');
  let description = $state('');
  let loaded      = $state(false);

  onMount(async () => {
    logClick('teaching');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'teaching'), limit(1))
      );
      if (!snap.empty) {
        const c    = snap.docs[0].data().content ?? {};
        heading     = c.heading     ?? '';
        description = c.description ?? '';
      }
    } catch (_) {}
    loaded = true;
  });

  /** @param {string} id */
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSeeWork() {
    activeCategory.set('pfe');
    scrollTo('projects');
  }
</script>

{#if loaded}
<section class="teaching" id="teaching">
  <div class="layout">

    <div class="text-col">
      <span class="section-label">Teaching</span>
      {#if heading}<h2 class="heading">{heading}</h2>{/if}
      {#if description}<p class="desc">{description}</p>{/if}
      <div class="buttons">
        <button class="btn-filled"   onclick={() => scrollTo('contact')}>Get in Touch</button>
        <button class="btn-outlined" onclick={handleSeeWork}>See What I've Taught</button>
      </div>
    </div>

    <div class="photo-col">
      <div class="photo-frame">
        <img src="/images/profile/teacher.webp" alt="Yassine Dhouib teaching" />
      </div>
    </div>

  </div>
</section>
{/if}

<style>
  .teaching { padding: 7rem 5vw 5rem; background-color: var(--bg); color: var(--text); transition: background-color 0.35s ease, color 0.35s ease; }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }

  .section-label { display: block; font-family: var(--font-body); font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-bottom: 0.75rem; }

  .heading { font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.75rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; color: var(--text); margin-bottom: 1.25rem; }

  .desc { font-family: var(--font-body); font-size: 1rem; line-height: 1.8; color: var(--text-muted); margin-bottom: 2rem; max-width: 440px; }

  .buttons { display: flex; gap: 0.875rem; flex-wrap: wrap; }

  .btn-filled { background: var(--accent); color: #fff; border: none; padding: 0.75rem 1.75rem; font-family: var(--font-body); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s ease; }
  .btn-filled:hover { opacity: 0.88; }

  .btn-outlined { background: transparent; color: var(--accent); border: 1px solid var(--accent); padding: 0.75rem 1.75rem; font-family: var(--font-body); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease; }
  .btn-outlined:hover { background: var(--accent); color: #fff; }

  .photo-col { display: flex; justify-content: center; align-items: center; }

  .photo-frame { width: 340px; height: 400px; border-radius: 0; border: 3px solid var(--accent); overflow: hidden; flex-shrink: 0; transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .photo-frame:hover { transform: scale(1.02); }
  .photo-frame img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }

  @media (max-width: 768px) {
    .teaching { padding: 5rem 1.5rem 3rem; }
    .layout   { grid-template-columns: 1fr; gap: 3rem; }
    .photo-col { order: -1; }
    .photo-frame { width: 260px; height: 300px; }
  }

  @media (max-width: 480px) {
    .teaching { padding: 4rem 16px 2.5rem; }
    .photo-frame { width: 100%; height: auto; aspect-ratio: 4/3; }
    .desc { max-width: 100%; }
  }
</style>
