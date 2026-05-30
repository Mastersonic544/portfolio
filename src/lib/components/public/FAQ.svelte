<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { logClick } from '$lib/utils/analytics.js';

  /** @type {{ q: string; a: string }[]} */
  let items  = $state([]);
  let loaded = $state(false);

  let openIndex = $state(-1);

  onMount(async () => {
    logClick('faq');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'faq'), limit(1))
      );
      if (!snap.empty) {
        items = snap.docs[0].data().items ?? [];
      }
    } catch (_) {}
    loaded = true;
  });

  /** @param {number} i */
  function toggle(i) {
    openIndex = openIndex === i ? -1 : i;
  }
</script>

{#if loaded && items.length}
<section class="faq" id="faq">
  <div class="section-head">
    <div class="meta">
      <span class="index">№ 06</span>
      <span class="label">Frequent questions</span>
    </div>
    <h2 class="section-title">The five things <em>everyone asks.</em></h2>
  </div>

  <div class="list">
    {#each items as item, i}
      <div class="item" class:open={openIndex === i}>
        <button class="q" onclick={() => toggle(i)} aria-expanded={openIndex === i}>
          <span class="q-num">Q.{(i + 1).toString().padStart(2, '0')}</span>
          <span class="q-text">{item.q}</span>
          <span class="q-toggle">+</span>
        </button>

        {#if openIndex === i}
          <div class="a" transition:slide={{ duration: 220 }}>
            <div class="answer">{item.a}</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
{/if}

<style>
  .faq {
    padding: 120px 60px;
    background-color: var(--bg);
    color: var(--text);
    border-top: 1px solid var(--border);
    transition: background-color 0.4s ease, color 0.4s ease;
  }

  .section-head {
    display: grid;
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    column-gap: 64px;
    align-items: end;
    margin-bottom: 64px;
  }
  .section-head .meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .section-head .index {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0;
    color: var(--accent);
  }
  .section-head .label {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-head .label::before {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--text-muted);
  }

  .section-title {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(26px, 4.6vw, 64px);
    letter-spacing: -0.03em;
    line-height: 1.0;
    margin: 0;
    color: var(--text);
  }
  .section-title em {
    font-style: normal;
    color: var(--accent);
  }

  .list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border);
  }

  .item {
    border-bottom: 1px solid var(--border);
  }

  .q {
    width: 100%;
    background: none;
    border: none;
    display: grid;
    grid-template-columns: 60px 1fr 40px;
    align-items: center;
    padding: 28px 0;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 18px;
    color: var(--text);
    transition: color 0.2s ease;
    outline: none;
  }

  .q:hover {
    color: var(--accent);
  }

  .q-num {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .q-text {
    line-height: 1.3;
  }

  /* Circular toggle indicator styling from portfolio.html */
  .q-toggle {
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 16px;
    line-height: 1;
    transition: transform 0.25s ease, border-color 0.25s ease;
    justify-self: end;
  }

  .open .q-toggle {
    transform: rotate(45deg);
    border-color: var(--accent);
  }

  .q:hover .q-toggle {
    border-color: var(--accent);
  }

  .a {
    overflow: hidden;
  }

  .answer {
    padding: 0 40px 32px 60px;
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 15px;
    line-height: 1.8;
    color: var(--text-muted);
    max-width: 64ch;
  }

  @media (max-width: 900px) {
    .faq {
      padding: 80px 24px;
    }
    .section-head {
      grid-template-columns: 1fr;
      row-gap: 16px;
      margin-bottom: 40px;
    }
    .q {
      grid-template-columns: 40px 1fr 32px;
      font-size: 16px;
    }
    .answer {
      padding: 0 0 24px 40px;
    }
  }

  @media (max-width: 480px) {
    .faq { padding: 56px 16px 40px; }
    .q {
      grid-template-columns: 32px 1fr 28px;
      font-size: 15px;
      padding: 20px 0;
    }
    .answer { padding: 0 0 20px 32px; }
  }
</style>
