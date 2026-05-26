<script>
  import { onMount } from 'svelte';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('about'));

  const education = [
    {
      institution: "ENET'Com",
      degree: 'Engineering — Networks & Telecoms',
      year: '2020 – 2025'
    },
    {
      institution: 'Lycée Pilote de Sfax',
      degree: 'Baccalaureate — Sciences',
      year: '2020'
    }
  ];

  const skills = [
    'SvelteKit', 'React', 'Node.js', 'Python', 'C++',
    'Firebase', 'Arduino', 'ESP32', 'IoT',
    'Figma', 'Adobe Premiere', 'After Effects',
    'Git', 'Linux', 'Tailwind'
  ];

  const quickScan = [
    { key: 'Location',     value: 'Sfax, Tunisia' },
    { key: 'Availability', value: 'Open to Remote' },
    { key: 'Languages',    value: 'Arabic · French · English' }
  ];
</script>

<section class="about" id="about">
  <span class="section-label">About</span>
  <h2 class="section-title">Building at the crossroads of code, design, and education.</h2>

  <div class="grid">
    <div class="bio-col">
      <p class="bio">
        Based in Sfax, Tunisia, I work across web development, digital design, and academic
        mentorship. I've shipped web platforms, IoT systems, and motion graphics — and guided
        dozens of engineering students through their final-year projects. I thrive where
        disciplines overlap and the brief has no obvious solution.
      </p>
    </div>

    <div class="meta-col">
      <div class="edu-cards">
        {#each education as edu}
          <div class="edu-card">
            <div class="edu-row">
              <span class="edu-institution">{edu.institution}</span>
              <span class="edu-year">{edu.year}</span>
            </div>
            <span class="edu-degree">{edu.degree}</span>
          </div>
        {/each}
      </div>

      <div class="skill-tags">
        {#each skills as skill}
          <span class="skill-tag">{skill}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="quick-scan">
    {#each quickScan as item}
      <div class="scan-item">
        <span class="scan-key">{item.key}</span>
        <span class="scan-val">{item.value}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .about {
    padding: 7rem 5vw 5rem;
    background-color: var(--bg);
    color: var(--text);
    transition: background-color 0.35s ease, color 0.35s ease;
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
    font-size: clamp(1.75rem, 3vw, 2.75rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text);
    max-width: 640px;
    margin-bottom: 3rem;
  }

  /* ── Two-column layout ─────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: 4rem;
    align-items: start;
    margin-bottom: 3.5rem;
  }

  .bio {
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text-muted);
  }

  /* ── Education cards ───────────────────────── */
  .edu-cards {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-bottom: 1.5rem;
  }

  .edu-card {
    border: 1px solid var(--bg-card);
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: border-color 0.2s ease;
  }

  .edu-card:hover {
    border-color: var(--text-muted);
  }

  .edu-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .edu-institution {
    font-family: var(--font-heading);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .edu-year {
    font-family: var(--font-body);
    font-size: 0.7rem;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .edu-degree {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* ── Skill tags ─────────────────────────────── */
  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .skill-tag {
    display: inline-block;
    background: var(--bg-card);
    color: var(--text);
    padding: 0.28rem 0.6rem;
    border-radius: 4px;
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* ── Quick-scan row ────────────────────────── */
  .quick-scan {
    display: flex;
    gap: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--bg-card);
    flex-wrap: wrap;
  }

  .scan-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .scan-key {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .scan-val {
    font-family: var(--font-heading);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 768px) {
    .about {
      padding: 5rem 1.5rem 3.5rem;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      margin-bottom: 2.5rem;
    }

    .quick-scan {
      gap: 2rem 3rem;
    }
  }
</style>
