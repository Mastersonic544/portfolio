<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { theme } from '$lib/stores/theme.js';
  import { logClick } from '$lib/utils/analytics.js';

  const leftKPIs = [
    { num: 5,  suffix: '+', label: 'Years Building' },
    { num: 48, suffix: '+', label: 'GitHub Repos' },
    { num: 3,  suffix: '',  label: 'Fields — Dev, Design, IoT' }
  ];

  const rightKPIs = [
    { num: null, display: 'Hackathon', suffix: '', label: 'Winner — Shifters' },
    { num: 100,  suffix: '+', label: 'Students Taught' },
    { num: 20,   suffix: '+', label: 'PFE Projects' }
  ];

  const companies = [
    { slug: 'dalmar', name: 'Dalmar' },
    { slug: 'enet',   name: 'ENET' },
    { slug: 'rs',     name: 'RS' }
  ];

  /** @type {HTMLElement} */
  let heroEl;

  function toggleTheme() {
    theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  onMount(() => {
    logClick('hero');
    const unsub = theme.subscribe(v => {
      document.documentElement.setAttribute('data-theme', v);
    });

    // Count-up animation for numeric KPIs
    heroEl.querySelectorAll('[data-count-target]').forEach(el => {
      const target = parseInt(/** @type {HTMLElement} */ (el).dataset.countTarget, 10);
      const suffix = /** @type {HTMLElement} */ (el).dataset.countSuffix ?? '';
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.35,
        onUpdate() {
          el.textContent = Math.round(proxy.val) + suffix;
        }
      });
    });

    return unsub;
  });
</script>

<!-- Fixed keyboard-key dark mode toggle -->
<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle dark mode">⇧</button>

<section class="hero" bind:this={heroEl}>

  <h1 class="headline">Developer. Designer. Teacher. Based in Sfax.</h1>

  <div class="columns">
    <!-- Left KPIs -->
    <div class="kpi-col kpi-left">
      {#each leftKPIs as kpi}
        <div class="kpi">
          {#if kpi.num !== null}
            <span
              class="kpi-num"
              data-count-target={kpi.num}
              data-count-suffix={kpi.suffix}
            >0{kpi.suffix}</span>
          {:else}
            <span class="kpi-num kpi-word">{kpi.display}</span>
          {/if}
          <span class="kpi-label">{kpi.label}</span>
        </div>
      {/each}
    </div>

    <!-- Center photo -->
    <div class="photo-col">
      <div class="photo-frame">
        <img src="/images/profile/hero.webp" alt="Yassine Dhouib - Shift" />
      </div>
    </div>

    <!-- Right KPIs -->
    <div class="kpi-col kpi-right">
      {#each rightKPIs as kpi}
        <div class="kpi">
          {#if kpi.num !== null}
            <span
              class="kpi-num"
              data-count-target={kpi.num}
              data-count-suffix={kpi.suffix}
            >0{kpi.suffix}</span>
          {:else}
            <span class="kpi-num kpi-word">{kpi.display}</span>
          {/if}
          <span class="kpi-label">{kpi.label}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Divider + company logos -->
  <div class="bottom">
    <hr class="divider" />
    <div class="companies">
      {#each companies as co}
        <div class="company-logo">
          <img src="/images/companies/{co.slug}.webp" alt={co.name} />
        </div>
      {/each}
    </div>
  </div>

</section>

<style>
  /* ─── Theme toggle (keyboard key) ──────────────────────── */
  .theme-toggle {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 200;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.1rem;
    line-height: 1;
    background: var(--bg);
    color: var(--text);
    border: 1.5px solid var(--text-muted);
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    /* bottom shadow gives the physical key illusion */
    box-shadow: 0 2.5px 0 var(--text-muted);
    cursor: pointer;
    user-select: none;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.08s ease,
      transform 0.08s ease;
  }

  .theme-toggle:active {
    transform: translateY(2px);
    box-shadow: none;
  }

  /* ─── Hero section ──────────────────────────────────────── */
  .hero {
    min-height: 100vh;
    background-color: var(--bg);
    color: var(--text);
    padding: 5rem 5vw 3rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  /* ─── Headline ──────────────────────────────────────────── */
  .headline {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 4.5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.1;
    color: var(--text);
    letter-spacing: -0.03em;
    max-width: 800px;
  }

  /* ─── Three-column grid ─────────────────────────────────── */
  .columns {
    display: grid;
    grid-template-columns: 1fr 320px 1fr;
    grid-template-areas: 'left photo right';
    align-items: center;
    gap: 2rem 3.5rem;
    flex: 1;
  }

  /* ─── KPI columns ───────────────────────────────────────── */
  .kpi-col {
    display: flex;
    flex-direction: column;
    gap: 2.75rem;
  }

  .kpi-left {
    grid-area: left;
    align-items: flex-end;
    text-align: right;
  }

  .kpi-right {
    grid-area: right;
    align-items: flex-start;
    text-align: left;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .kpi-num {
    font-family: var(--font-heading);
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text);
    letter-spacing: -0.04em;
  }

  /* Text-based KPI (e.g. "Hackathon") — slightly smaller for balance */
  .kpi-word {
    font-size: 1.75rem;
    letter-spacing: -0.02em;
  }

  .kpi-label {
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ─── Photo frame ───────────────────────────────────────── */
  .photo-col {
    grid-area: photo;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .photo-frame {
    width: 320px;
    height: 420px;
    border-radius: 50% / 40%;
    border: 3px solid var(--accent);
    overflow: hidden;
    flex-shrink: 0;
    /* Spring-like ease gives a soft bounce on hover */
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .photo-frame:hover {
    transform: scale(1.02);
  }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  /* ─── Bottom: divider + company logos ───────────────────── */
  .bottom {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .divider {
    border: none;
    height: 1px;
    background-color: var(--bg-card);
  }

  .companies {
    display: flex;
    align-items: center;
    gap: 3rem;
    flex-wrap: wrap;
    padding: 0.25rem 0;
  }

  .company-logo {
    height: 28px;
    opacity: 0.4;
    filter: grayscale(1);
    transition: opacity 0.25s ease, filter 0.25s ease;
  }

  .company-logo:hover {
    opacity: 0.8;
    filter: grayscale(0);
  }

  .company-logo img {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }

  /* ─── Mobile ────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .hero {
      padding: 4.5rem 1.5rem 2.5rem;
      gap: 2rem;
    }

    /* Photo row (full width) + KPI columns side by side below */
    .columns {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        'photo  photo'
        'left   right';
      gap: 2rem 1.25rem;
    }

    .photo-frame {
      width: 220px;
      height: 290px;
    }

    /* Both KPI cols left-aligned on mobile for readability */
    .kpi-left,
    .kpi-right {
      align-items: flex-start;
      text-align: left;
    }

    .kpi-col {
      gap: 1.75rem;
    }

    .kpi-num {
      font-size: 2.25rem;
    }

    .kpi-word {
      font-size: 1.3rem;
    }

    .companies {
      gap: 2rem;
    }
  }

  @media (max-width: 400px) {
    .photo-frame {
      width: 180px;
      height: 240px;
    }
  }
</style>
