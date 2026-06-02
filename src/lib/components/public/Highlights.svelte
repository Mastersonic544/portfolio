<script>
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { inView } from 'motion';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { logClick } from '$lib/utils/analytics.js';

  /** @type {{ slug: string; date: string; caption: string; url?: string }[]} */
  let highlights = $state([]);
  let loaded     = $state(false);
  let revealed   = $state(false);

  // Which photo sits on top within each cluster (keyed by cluster index)
  /** @type {Record<number, number>} */
  let activeTop = $state({});

  /** @type {HTMLElement} */
  let sectionEl = $state();

  // Group photos into clusters of 3 → e.g. 8 photos become [3, 3, 2].
  // Auto-adapts as more moments are added via the CMS.
  let clusters = $derived.by(() => {
    /** @type {typeof highlights[]} */
    const out = [];
    for (let i = 0; i < highlights.length; i += 3) out.push(highlights.slice(i, i + 3));
    return out;
  });

  /** @param {number} ci */
  const topOf = (ci) => activeTop[ci] ?? 0;

  /** Bring photo `j` to the front of cluster `ci`. @param {number} ci @param {number} j */
  function bringToTop(ci, j) {
    activeTop = { ...activeTop, [ci]: j };
  }

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

    // Wait for Svelte to flush DOM updates before wiring up the reveal-on-scroll
    await tick();
    if (!sectionEl) return;
    inView(sectionEl, () => { revealed = true; }, { amount: 0.15 });
  });
</script>

{#if loaded && highlights.length}
<section class="highlights" id="highlights" bind:this={sectionEl}>
  <h2 class="section-title">Moments</h2>

  <p class="hint">Tap a photo to bring it to the front</p>

  <div class="clusters" class:in={revealed}>
    {#each clusters as cluster, ci}
      <div class="cluster">
        {#each cluster as item, j}
          <!-- Each photo in the stack; clicking animates it to the top -->
          <button
            type="button"
            class="polaroid-outer"
            class:active={topOf(ci) === j}
            style="--i: {j}; --rot: {j % 3 === 0 ? '-5deg' : j % 3 === 1 ? '4deg' : '-2deg'}; z-index: {topOf(ci) === j ? 50 : 10 - j};"
            onclick={() => bringToTop(ci, j)}
            aria-label={`Bring "${item.caption}" to the front`}
          >
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
          </button>
        {/each}
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
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 3rem;
  }

  .hint {
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    margin: -2rem 0 3.5rem;
  }

  /* Clusters of stacked polaroids, laid out in a wrapping row */
  .clusters {
    display: flex;
    flex-wrap: wrap;
    gap: 6rem 5rem;
    justify-content: center;
    align-items: flex-start;
  }

  .cluster {
    position: relative;
    width: 240px;
    height: 360px;
    flex-shrink: 0;
  }

  .polaroid-outer {
    position: absolute;
    top: 0;
    left: 0;
    width: 220px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    /* Fan the stack out by index; clicking the active one lifts it forward */
    transform: rotate(var(--rot)) translate(calc(var(--i) * 16px), calc(var(--i) * 12px));
    transform-origin: center bottom;
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.55s ease;
  }

  .clusters.in .polaroid-outer { opacity: 1; }

  .polaroid-outer.active {
    transform: rotate(0deg) translateY(-16px) scale(1.04);
  }

  .polaroid {
    background: #FFFFFF;
    padding: 12px 12px 28px;
    border-radius: 2px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06);
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
    .clusters { gap: 5rem 3rem; }
  }
  @media (max-width: 480px) {
    .highlights { padding: 4rem 16px 2.5rem; }
    /* Clusters stack vertically and shrink to fit narrow screens */
    .clusters { gap: 4.5rem 3rem; }
    .cluster { width: 210px; height: 330px; }
    .polaroid-outer { width: 190px; }
  }
</style>
