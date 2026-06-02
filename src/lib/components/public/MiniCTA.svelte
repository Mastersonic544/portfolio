<script>
  import CvModal from './CvModal.svelte';
  let cvOpen = $state(false);
</script>

<div class="mini-cta">
  <div class="mini-inner">
    <a class="mini-btn mini-btn-primary" href="#contact">Get in touch</a>
    <button class="mini-btn mini-btn-ghost" onclick={() => (cvOpen = true)}>
      Download CV <span class="arr">↓</span>
    </button>
  </div>
</div>

<CvModal open={cvOpen} onclose={() => (cvOpen = false)} />

<style>
  .mini-cta {
    width: 100%;
    padding: 1.125rem 5vw;
    border-top: 1px solid var(--border);
    background: var(--bg);
    transition: background-color 0.35s ease;
  }

  .mini-inner {
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.45rem 1.125rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;
  }

  .mini-btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .mini-btn-primary:hover { opacity: 0.88; }

  .mini-btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .mini-btn-ghost:hover { border-color: var(--text-muted); color: var(--text); }

  .arr { font-size: 0.75rem; }

  @media (max-width: 600px) {
    .mini-inner { justify-content: stretch; }
    .mini-btn { flex: 1; justify-content: center; }
  }
</style>
