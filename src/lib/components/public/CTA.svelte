<script>
  import CvModal from './CvModal.svelte';
  import { logClick } from '$lib/utils/analytics.js';

  let cvOpen = $state(false);

  function openCv() {
    logClick('cta-cv');
    cvOpen = true;
  }
</script>

<section class="cta" id="cta">
  <div class="cta-inner">
    <div class="cta-text">
      <span class="cta-label">Let's work</span>
      <h2 class="cta-headline">Ready to build<br/>something <em>real?</em></h2>
    </div>
    <div class="cta-actions">
      <a
        class="btn btn-primary"
        href="#contact"
        onclick={() => logClick('cta-contact')}
      >
        Get in touch
        <span class="btn-arrow">→</span>
      </a>
      <button class="btn btn-outline" onclick={openCv}>
        Download CV
        <span class="btn-arrow">↓</span>
      </button>
    </div>
  </div>
</section>

<CvModal open={cvOpen} onclose={() => (cvOpen = false)} />

<style>
  .cta {
    padding: 6rem 5vw;
    background: var(--bg);
    border-top: 1px solid var(--border);
    transition: background-color 0.35s ease;
  }

  .cta-inner {
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .cta-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .cta-headline {
    font-family: var(--font-heading);
    font-size: clamp(2.25rem, 5vw, 3.75rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.05;
    color: var(--text);
    margin: 0;
  }

  .cta-headline em {
    font-style: normal;
    color: var(--accent);
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem 2rem;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover { opacity: 0.88; }

  .btn-outline {
    background: transparent;
    border: 1.5px solid var(--text);
    color: var(--text);
  }
  .btn-outline:hover { background: var(--text); color: var(--bg); }

  .btn-arrow {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }
  .btn:hover .btn-arrow { transform: translateY(2px); }
  .btn-primary:hover .btn-arrow { transform: translateX(3px); }

  @media (max-width: 768px) {
    .cta { padding: 4rem 1.5rem; }
    .cta-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
  }

  @media (max-width: 480px) {
    .cta { padding: 3rem 1rem; }
    .cta-actions { width: 100%; }
    .btn { flex: 1; justify-content: center; padding: 0.875rem 1.25rem; }
  }
</style>
