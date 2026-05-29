<script>
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { inView, animate } from 'motion';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { logClick } from '$lib/utils/analytics.js';

  /** @type {{ slug: string; date: string; caption: string; url?: string }[]} */
  let highlights = $state([]);
  let loaded     = $state(false);

  /** @type {HTMLElement} */
  let sectionEl = $state();

  onMount(async () => {
    logClick('highlights');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'highlights'), limit(1))
      );
      if (!snap.empty) {
        highlights = snap.docs[0].data().items ?? [];
      }
    } catch (_) {}
    loaded = true;

    // Wait for Svelte to flush DOM updates before wiring up animations
    await tick();
    if (!sectionEl) return;
    const polaroids = sectionEl.querySelectorAll('.polaroid');
    polaroids.forEach((el, i) => {
      inView(el, () => {
        animate(el, { opacity: [0, 1], y: [36, 0] }, { duration: 0.55, delay: i * 0.12, easing: [0.22, 1, 0.36, 1] });
      }, { amount: 0.2 });
    });
  });
</script>

{#if loaded && highlights.length}
<section class="highlights" id="highlights" bind:this={sectionEl}>
  <h2 class="section-title">Moments</h2>

  <div class="grid">
    {#each highlights as item, i}
      <!-- Alternating angles of rotation, styled exactly as portfolio.html -->
      <div class="polaroid-outer" style="--rot: {i % 3 === 0 ? '-4deg' : i % 3 === 1 ? '3deg' : '-1.5deg'}">
        <div class="polaroid">
          <div class="photo">
            <img src={item.url || `/images/highlights/${item.slug}.webp`} alt={item.caption} loading="lazy"
              onerror={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div class="cap">
            {item.caption}
            <span class="cap-date">{item.date}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
{/if}

<style>
  .highlights {
    padding: 7rem 60px 5rem;
    background-color: var(--bg-card);
    color: var(--text);
    border-top: 1px solid var(--border);
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

  .grid {
    display: grid;
    /* auto-fill: adapts to any item count added via CMS */
    grid-template-columns: repeat(auto-fill, minmax(min(270px, 100%), 1fr));
    gap: 2.5rem;
    align-items: start;
  }

  .polaroid-outer {
    transform: rotate(var(--rot));
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  }
  .polaroid-outer:hover {
    transform: rotate(0deg) translateY(-6px) scale(1.03);
    z-index: 5;
  }

  .polaroid {
    background: #FFFFFF;
    padding: 12px 12px 28px;
    border-radius: 2px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06);
    opacity: 0; /* Animated into view */
    transition: background 0.4s ease;
  }

  :root[data-theme="dark"] .polaroid {
    background: #F2F0EB;
  }

  .photo {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background:
      repeating-linear-gradient(
        135deg,
        #ECEAE4 0,
        #ECEAE4 9px,
        #E0DDD5 9px,
        #E0DDD5 10px
      );
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cap {
    margin: 14px 4px 0;
    font-family: 'Caveat', cursive;
    font-weight: 400;
    font-size: 17px;
    line-height: 1.2;
    color: #2A2A2A;
    text-align: left;
  }

  .cap-date {
    display: block;
    margin-top: 4px;
    font-family: 'Caveat', cursive;
    font-size: 14px;
    color: #8A8580;
  }

  @media (max-width: 900px) {
    .highlights { padding: 5rem 24px 3rem; }
  }
  @media (max-width: 480px) {
    .highlights { padding: 4rem 16px 2.5rem; }
    /* Single-column on phones; cards fill full width */
    .grid { grid-template-columns: 1fr; }
  }
</style>
