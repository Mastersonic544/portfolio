<script>
  import { onMount } from 'svelte';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('availability'));
</script>

<div class="banner">
  <p>Available for freelance &amp; open to full-time — Sfax, Tunisia · Remote</p>
</div>

<style>
  .banner {
    width: 100%;
    background: var(--accent);
    padding: 1.5rem 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  p {
    font-family: var(--font-heading);
    font-size: clamp(0.875rem, 2vw, 1.1rem);
    font-weight: 500;
    color: #fff;
    text-align: center;
    letter-spacing: -0.01em;
    margin: 0;
  }
</style>
