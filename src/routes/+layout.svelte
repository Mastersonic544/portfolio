<script>
  import '../app.css';
  import 'virtual:uno.css';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme.js';
  import { inject } from '@vercel/analytics';

  let { children } = $props();

  onMount(() => {
    // Mirror the dark value as a .dark class so both selectors work
    const unsub = theme.subscribe((value) => {
      document.documentElement.classList.toggle('dark', value === 'dark');
    });
    inject();
    return unsub;
  });
</script>

{@render children()}
