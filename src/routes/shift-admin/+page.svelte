<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
  import { auth } from '$lib/firebase.js';

  let email      = $state('');
  let password   = $state('');
  let submitting = $state(false);
  let authError  = $state(false);

  onMount(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) goto('/shift-admin/dashboard');
    });
    return unsub;
  });

  async function handleLogin(/** @type {SubmitEvent} */ e) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    authError  = false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      goto('/shift-admin/dashboard');
    } catch {
      authError = true;
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Admin — Shift</title>
</svelte:head>

<div class="login-wrap">
  <form class="login-form" onsubmit={handleLogin} novalidate>
    <p class="brand">shift / admin</p>

    <div class="field">
      <label for="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        bind:value={email}
        required
        autocomplete="username"
      />
    </div>

    <div class="field">
      <label for="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        bind:value={password}
        required
        autocomplete="current-password"
      />
    </div>

    {#if authError}
      <p class="auth-error">Invalid credentials.</p>
    {/if}

    <button type="submit" class="login-btn" disabled={submitting}>
      {submitting ? 'Signing in…' : 'Sign in'}
    </button>
  </form>
</div>

<style>
  .login-wrap {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    transition: background-color 0.35s ease;
  }

  .login-form {
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .brand {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .field label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .field input {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--text-muted);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.9rem;
    padding: 0.5rem 0;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .field input:focus { border-bottom-color: var(--accent); }

  .auth-error {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: #e53e3e;
    margin: -0.5rem 0;
  }

  .login-btn {
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.8rem 2rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .login-btn:hover:not(:disabled) { opacity: 0.88; }
  .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
