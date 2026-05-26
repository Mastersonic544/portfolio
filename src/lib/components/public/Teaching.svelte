<script>
  import { onMount } from 'svelte';
  import { activeCategory } from '$lib/stores/projects.js';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('teaching'));

  /** @param {string} id */
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSeeWork() {
    activeCategory.set('pfe');
    scrollTo('projects');
  }
</script>

<section class="teaching" id="teaching">
  <div class="layout">

    <!-- Left: text content -->
    <div class="text-col">
      <span class="section-label">Teaching</span>
      <h2 class="heading">I'll teach you something you didn't know.</h2>
      <p class="desc">
        Whether it's code, design, IoT, or academic writing — I'm open to teaching
        any skill to anyone who genuinely wants to learn. One-on-one sessions,
        workshops, or long-form mentoring.
      </p>
      <div class="buttons">
        <button class="btn-filled" onclick={() => scrollTo('contact')}>Get in Touch</button>
        <button class="btn-outlined" onclick={handleSeeWork}>See What I've Taught</button>
      </div>
    </div>

    <!-- Right: oval photo frame -->
    <div class="photo-col">
      <div class="photo-frame">
        <img src="/images/profile/teacher.webp" alt="Yassine Dhouib teaching" />
      </div>
    </div>

  </div>
</section>

<style>
  .teaching {
    padding: 7rem 5vw 5rem;
    background-color: var(--bg);
    color: var(--text);
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  /* ── Text column ────────────────────────────── */
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

  .heading {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 3vw, 2.75rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text);
    margin-bottom: 1.25rem;
  }

  .desc {
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text-muted);
    margin-bottom: 2rem;
    max-width: 440px;
  }

  .buttons {
    display: flex;
    gap: 0.875rem;
    flex-wrap: wrap;
  }

  .btn-filled {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.75rem 1.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .btn-filled:hover { opacity: 0.88; }

  .btn-outlined {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 0.75rem 1.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .btn-outlined:hover {
    background: var(--accent);
    color: #fff;
  }

  /* ── Photo column ───────────────────────────── */
  .photo-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .photo-frame {
    width: 240px;
    height: 320px;
    border-radius: 50% / 40%;
    border: 3px solid var(--accent);
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .photo-frame:hover { transform: scale(1.02); }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 768px) {
    .teaching { padding: 5rem 1.5rem 3rem; }

    .layout {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .photo-col { order: -1; }

    .photo-frame {
      width: 180px;
      height: 240px;
    }
  }
</style>
