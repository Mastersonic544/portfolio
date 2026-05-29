<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onAuthStateChanged, signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase.js';

  let { children } = $props();

  let authed   = $state(false);
  let checking = $state(true);

  onMount(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      authed   = !!user;
      checking = false;
      if (!user && $page.url.pathname !== '/shift-admin') goto('/shift-admin');
    });
    return unsub;
  });

  async function handleLogout() {
    await signOut(auth);
    goto('/shift-admin');
  }
</script>

{#if $page.url.pathname === '/shift-admin'}
  {@render children()}

{:else if checking}
  <div class="auth-shell"></div>

{:else if authed}
  <div class="admin-shell">
    <header class="admin-header">
      <span class="brand">shift / admin</span>

      <nav class="tab-nav">
        <a
          class="tab"
          class:active={$page.url.pathname.startsWith('/shift-admin/dashboard')}
          href="/shift-admin/dashboard"
        >Dashboard</a>
        <a
          class="tab"
          class:active={$page.url.pathname.startsWith('/shift-admin/cms')}
          href="/shift-admin/cms"
        >CMS</a>
        <a
          class="tab"
          class:active={$page.url.pathname.startsWith('/shift-admin/projects')}
          href="/shift-admin/projects"
        >Projects</a>
        <a
          class="tab"
          class:active={$page.url.pathname.startsWith('/shift-admin/migrate')}
          href="/shift-admin/migrate"
        >Migrate</a>
      </nav>

      <button class="logout-btn" onclick={handleLogout}>Log out</button>
    </header>

    <main class="admin-main">
      {@render children()}
    </main>
  </div>
{/if}

<style>
  .auth-shell {
    min-height: 100vh;
    background: var(--bg);
  }

  .admin-shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  /* ── Header ─────────────────────────────────── */
  .admin-header {
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 0 2rem;
    height: 52px;
    border-bottom: 1px solid var(--bg-card);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
    transition: background-color 0.35s ease, border-color 0.35s ease;
  }

  .brand {
    display: flex;
    align-items: center;
    font-family: var(--font-heading);
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: -0.01em;
    padding-right: 2rem;
    flex-shrink: 0;
  }

  .tab-nav {
    display: flex;
    align-items: stretch;
    flex: 1;
  }

  .tab {
    display: flex;
    align-items: center;
    padding: 0 1.25rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    position: relative;
    top: 1px;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .tab:hover { color: var(--text); }
  .tab.active { color: var(--text); border-bottom-color: var(--accent); }

  .logout-btn {
    margin-left: auto;
    align-self: center;
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.3rem 0.875rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .logout-btn:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }

  @media (max-width: 640px) {
    .admin-header { height: auto; min-height: 48px; flex-wrap: wrap; padding: 0 1rem; gap: 0; }
    .brand { padding: 0.75rem 1rem 0.75rem 0; font-size: 0.75rem; }
    .tab-nav { order: 3; width: 100%; overflow-x: auto; scrollbar-width: none; border-top: 1px solid var(--bg-card); }
    .tab-nav::-webkit-scrollbar { display: none; }
    .tab { padding: 0 0.875rem; font-size: 0.75rem; height: 40px; white-space: nowrap; }
    .logout-btn { margin-left: 0; padding: 0.25rem 0.625rem; font-size: 0.72rem; }
  }

  /* ── Main area ──────────────────────────────── */
  .admin-main {
    flex: 1;
    padding: 2.5rem 2rem;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  @media (max-width: 480px) {
    .admin-main { padding: 1.5rem 1rem; }
  }
</style>
