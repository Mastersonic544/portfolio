<script>
  import { onMount } from 'svelte';
  import { inView, animate } from 'motion';
  import '@fontsource/caveat/400.css';
  import '@fontsource/caveat/700.css';
  import { logClick } from '$lib/utils/analytics.js';

  const highlights = [
    { slug: 'hackathon-win', date: 'Dec 2024', caption: 'Shifters hackathon — first place 🏆' },
    { slug: 'campus-talk',  date: 'Oct 2024', caption: "Teaching at ENET'Com" },
    { slug: 'iot-lab',      date: 'Sep 2024', caption: 'Late nights in the IoT lab' },
    { slug: 'sfax-design',  date: 'Aug 2024', caption: 'Design sprint, Sfax' }
  ];

  /** @type {HTMLElement} */
  let sectionEl;

  onMount(() => {
    logClick('highlights');
    const polaroids = sectionEl.querySelectorAll('.polaroid');
    polaroids.forEach((el, i) => {
      inView(
        el,
        () => {
          animate(
            el,
            { opacity: [0, 1], y: [36, 0] },
            { duration: 0.55, delay: i * 0.12, easing: [0.22, 1, 0.36, 1] }
          );
        },
        { amount: 0.2 }
      );
    });
  });
</script>

<section class="highlights" id="highlights" bind:this={sectionEl}>
  <h2 class="section-title">Moments</h2>

  <div class="grid">
    {#each highlights as item, i}
      <!-- Outer wrapper carries CSS rotation; inner .polaroid is what Motion One touches -->
      <div class="polaroid-outer" style="--rot: {i % 2 === 0 ? '-2deg' : '1.5deg'}">
        <div class="polaroid">
          <div class="image-wrap">
            <img
              src="/images/highlights/{item.slug}.webp"
              alt={item.caption}
              loading="lazy"
            />
          </div>
          <p class="date">{item.date}</p>
          <p class="caption">{item.caption}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .highlights {
    padding: 7rem 5vw 5rem;
    background-color: var(--bg-card);
    color: var(--text);
    transition: background-color 0.35s ease;
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 3rem;
  }

  /* ── Grid ───────────────────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
    align-items: start;
  }

  /* ── Outer: CSS rotation only ───────────────── */
  .polaroid-outer {
    transform: rotate(var(--rot));
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  }

  .polaroid-outer:hover {
    transform: rotate(0deg) scale(1.04);
    z-index: 2;
  }

  /* ── Polaroid card ──────────────────────────── */
  .polaroid {
    background: #fff;
    padding: 12px;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.06),
      0 8px 28px rgba(0, 0, 0, 0.1);
    opacity: 0; /* Motion One animates this to 1 */
  }

  /* ── Square image crop ──────────────────────── */
  .image-wrap {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: #ede9e3;
    margin-bottom: 10px;
  }

  .image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Handwritten text ───────────────────────── */
  .date {
    font-family: 'Caveat', cursive;
    font-size: 0.85rem;
    color: #aaa;
    margin-bottom: 2px;
    line-height: 1.2;
  }

  .caption {
    font-family: 'Caveat', cursive;
    font-size: 1.1rem;
    font-weight: 700;
    color: #2a2a2a;
    line-height: 1.3;
  }

  /* ── Responsive ─────────────────────────────── */
  @media (max-width: 1024px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .highlights { padding: 5rem 1.5rem 3rem; }
    .grid { grid-template-columns: 1fr; max-width: 320px; }
  }
</style>
