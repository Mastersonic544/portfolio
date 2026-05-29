<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { logClick } from '$lib/utils/analytics.js';

  let text   = $state('');
  let loaded = $state(false);

  onMount(async () => {
    logClick('availability');
    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'availability'), limit(1))
      );
      if (!snap.empty) {
        text = snap.docs[0].data().content?.text ?? '';
      }
    } catch (_) {}
    loaded = true;
  });
</script>

{#if loaded && text}
<div class="banner">
  <p>{text}</p>
</div>
{/if}

<style>
  .banner { width: 100%; background: var(--accent); padding: 1.5rem 5vw; display: flex; align-items: center; justify-content: center; }

  p { font-family: var(--font-heading); font-size: clamp(0.875rem, 2vw, 1.1rem); font-weight: 500; color: #fff; text-align: center; letter-spacing: -0.01em; margin: 0; }
</style>
