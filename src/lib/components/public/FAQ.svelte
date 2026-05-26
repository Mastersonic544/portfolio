<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('faq'));

  const items = [
    {
      q: 'Are you available for freelance work?',
      a: "Yes — I'm open to remote freelance projects of all sizes. Whether it's a one-week sprint or a multi-month engagement, reach out and we'll figure out what works."
    },
    {
      q: 'Do you help with PFE projects?',
      a: "Yes. I've helped 20+ students structure, build, and defend their final-year engineering projects. I offer guidance on both the technical side and academic writing."
    },
    {
      q: 'What technologies do you work with?',
      a: 'Primarily SvelteKit, React, Firebase, and Python on the software side — plus ESP32/Arduino for IoT. On the creative side: Figma, After Effects, and Premiere Pro.'
    },
    {
      q: 'Can you work with international clients?',
      a: "Absolutely. I'm fully remote-ready, async-friendly, and comfortable working across time zones. Most of my communication happens in English or French."
    },
    {
      q: 'Where are you based?',
      a: 'Sfax, Tunisia — available for remote work worldwide and open to occasional on-site engagements in Tunisia.'
    },
    {
      q: 'Do you teach?',
      a: "Yes — I've taught 100+ students across code, design, IoT, and academic writing. I offer one-on-one sessions, small group workshops, and long-form mentoring."
    }
  ];

  let openIndex = $state(-1);

  /** @param {number} i */
  function toggle(i) {
    openIndex = openIndex === i ? -1 : i;
  }
</script>

<section class="faq" id="faq">
  <div class="inner">
    <span class="section-label">FAQ</span>
    <h2 class="section-title">Common Questions</h2>

    <div class="list">
      {#each items as item, i}
        <div class="item" class:open={openIndex === i}>
          <button class="question" onclick={() => toggle(i)} aria-expanded={openIndex === i}>
            <span>{item.q}</span>
            <span class="indicator">{openIndex === i ? '−' : '+'}</span>
          </button>

          {#if openIndex === i}
            <div class="answer" transition:slide={{ duration: 260 }}>
              <p>{item.a}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .faq {
    padding: 7rem 5vw 6rem;
    background-color: var(--bg);
    color: var(--text);
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  .inner {
    max-width: 720px;
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

  /* ── Accordion list ─────────────────────────── */
  .list {
    display: flex;
    flex-direction: column;
  }

  .item {
    border-top: 1px solid var(--bg-card);
  }

  .item:last-child {
    border-bottom: 1px solid var(--bg-card);
  }

  .question {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    background: transparent;
    border: none;
    padding: 1.375rem 0;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    transition: color 0.2s ease;
  }

  .question:hover { color: var(--accent); }

  .open .question { color: var(--accent); }

  .indicator {
    flex-shrink: 0;
    font-family: var(--font-body);
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1;
    color: var(--accent);
  }

  .answer {
    overflow: hidden;
  }

  .answer p {
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.75;
    color: var(--text-muted);
    padding-bottom: 1.375rem;
    margin: 0;
  }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 768px) {
    .faq { padding: 5rem 1.5rem 4rem; }
  }
</style>
