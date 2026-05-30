<script>
  import { onMount, tick } from 'svelte';
  import { collection, doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  /** @type {{ open?: boolean; onclose?: () => void }} */
  let { open = false, onclose } = $props();

  /** @type {{ label: string; url: string }[]} */
  let cvs     = $state([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'cvs'));
      if (snap.exists()) cvs = snap.data().list ?? [];
    } catch { /* silent */ }
    loading = false;
  });

  function close() { onclose?.(); }

  /** @param {KeyboardEvent} e */
  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop" role="presentation" onclick={close}></div>

  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label="Download CV"
    tabindex="-1"
    onkeydown={onKeydown}
  >
    <div class="modal-header">
      <span class="modal-title">Download CV</span>
      <button class="close-btn" onclick={close} aria-label="Close">✕</button>
    </div>

    <div class="modal-body">
      {#if loading}
        <p class="hint">Loading…</p>
      {:else if cvs.length === 0}
        <p class="hint">No CVs available yet.</p>
      {:else}
        <p class="modal-desc">Choose a version to download:</p>
        <div class="cv-list">
          {#each cvs as cv}
            <a
              class="cv-btn"
              href={cv.url}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <span class="cv-label">{cv.label}</span>
              <span class="cv-arrow">↓</span>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 400;
    backdrop-filter: blur(2px);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 401;
    width: min(420px, calc(100vw - 2rem));
    background: var(--bg-card);
    border: 1px solid var(--border);
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    animation: modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes modal-in {
    from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-title {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s ease;
    padding: 0.25rem;
  }
  .close-btn:hover { color: var(--text); }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-desc {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }

  .cv-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cv-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 1.125rem;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .cv-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

  .cv-arrow {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }
</style>
