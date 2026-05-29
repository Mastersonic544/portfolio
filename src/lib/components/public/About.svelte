<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { logClick } from '$lib/utils/analytics.js';

  let bio       = $state('');
  let education = $state([]);
  let skills    = $state([]);
  let quickScan = $state([]);
  let loaded    = $state(false);

  onMount(async () => {
    logClick('about');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'about'), limit(1))
      );
      if (!snap.empty) {
        const data = snap.docs[0].data();
        bio       = data.content?.bio ?? '';
        education = data.education   ?? [];
        skills    = data.skills      ?? [];
        quickScan = data.quickScan   ?? [];
      }
    } catch (_) {}
    loaded = true;
  });
</script>

{#if loaded}
<section class="about" id="about">
  <div class="section-head">
    <div class="meta">
      <span class="index">№ 02</span>
      <span class="label">About</span>
    </div>
    <h2 class="title">Full stack developer. Creative technologist. Multi-disciplinary builder based in Sfax, Tunisia.</h2>
  </div>

  <div class="grid">
    <div class="bio-col">
      {#if bio}<p class="bio">{bio}</p>{/if}
    </div>

    <div class="meta-col">
      {#if education.length}
      <div class="edu">
        {#each education as edu}
          <div class="edu-row">
            <span class="edu-year">{edu.year}</span>
            <div class="edu-detail">
              <h4>{edu.degree}</h4>
              <p>{edu.institution}</p>
            </div>
          </div>
        {/each}
      </div>
      {/if}

      {#if skills.length}
      <div class="skill-tags">
        {#each skills as skill}
          <span class="skill-tag">{skill}</span>
        {/each}
      </div>
      {/if}
    </div>
  </div>

  {#if quickScan.length}
  <div class="quick-scan">
    {#each quickScan as item}
      <div class="scan-item">
        <span class="scan-key">{item.key}</span>
        <span class="scan-val">{item.value}</span>
      </div>
    {/each}
  </div>
  {/if}
</section>
{/if}

<style>
  .about {
    padding: 120px 60px;
    background-color: var(--bg);
    color: var(--text);
    border-top: 1px solid var(--border);
    transition: background-color 0.4s ease, color 0.4s ease;
  }

  /* Full-width vertical header stack to prevent squishing long titles */
  .section-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 64px;
  }
  .section-head .meta {
    display: flex;
    align-items: center;
    gap: 14px;
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

  .title {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(32px, 4.2vw, 56px);
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0;
    color: var(--text);
    max-width: 100%;
  }

  .grid {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 4rem;
    align-items: start;
    margin-bottom: 3.5rem;
  }

  .bio {
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 16px;
    line-height: 1.75;
    color: var(--text-muted);
  }

  .edu {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border);
    margin-bottom: 2rem;
  }

  /* Grid layout supporting long non-wrapping year ranges */
  .edu-row {
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: start;
    column-gap: 32px;
    padding: 24px 0;
    border-bottom: 1px solid var(--border);
    transition: padding-left 0.25s ease;
  }
  .edu-row:hover {
    padding-left: 8px;
  }

  .edu-year {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 28px;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--text);
    white-space: nowrap;
  }

  .edu-detail h4 {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 16px;
    line-height: 1.35;
    margin: 0 0 6px;
    color: var(--text);
  }

  .edu-detail p {
    margin: 0;
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 13px;
    color: var(--text-muted);
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-tag {
    display: inline-block;
    background: var(--bg-card);
    color: var(--text);
    padding: 5px 12px;
    border-radius: 3px;
    border: 0.5px solid var(--border);
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.02em;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .skill-tag:hover {
    background: var(--bg-card-hover);
    border-color: var(--accent);
  }

  .quick-scan {
    display: flex;
    justify-content: center;
    gap: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .scan-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .scan-key {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--text-muted);
  }

  .scan-val {
    font-family: var(--font-heading);
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  @media (max-width: 900px) {
    .about {
      padding: 80px 24px;
    }
    .grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
    }
    .quick-scan {
      gap: 2rem 3rem;
    }
    .edu-row {
      grid-template-columns: max-content 1fr;
      column-gap: 20px;
    }
  }

  @media (max-width: 480px) {
    .about { padding: 56px 16px 48px; }
    .section-head { margin-bottom: 40px; }
    .edu-year { font-size: 22px; }
    .quick-scan { gap: 1.5rem 2rem; }
  }
</style>
