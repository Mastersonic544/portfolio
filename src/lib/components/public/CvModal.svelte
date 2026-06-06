<script>
  import { onMount } from 'svelte';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import {
    Code, PaintBrush, Stack, DeviceMobile, ChartBar,
    GraduationCap, Briefcase, FileText, FilmSlate
  } from 'phosphor-svelte';

  /** @type {Record<string, any>} */
  const ICON_MAP = {
    code:      Code,
    design:    PaintBrush,
    fullstack: Stack,
    mobile:    DeviceMobile,
    data:      ChartBar,
    video:     FilmSlate,
    academic:  GraduationCap,
    business:  Briefcase,
    general:   FileText,
  };

  /** @type {{ open?: boolean; onclose?: () => void }} */
  let { open = false, onclose } = $props();

  /** @type {{ label: string; icon: string; url: string }[]} */
  let cvs       = $state([]);
  let resumeUrl = $state('');
  let loading   = $state(true);

  onMount(async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'cvs'));
      if (snap.exists()) {
        cvs       = snap.data().list      ?? [];
        resumeUrl = snap.data().resumeUrl ?? '';
      }
    } catch { /* silent */ }
    loading = false;
  });

  function close() { onclose?.(); }

  /** @param {KeyboardEvent} e */
  function onKeydown(e) { if (e.key === 'Escape') close(); }
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
      {:else if cvs.length === 0 && !resumeUrl}
        <p class="hint">No CVs available yet.</p>
      {:else}
        {#if cvs.length > 0}
          <p class="modal-desc">Choose a version to download:</p>
          <div class="cv-grid">
            {#each cvs as cv}
              {@const Icon = ICON_MAP[cv.icon] ?? FileText}
              <a
                class="cv-card"
                href={cv.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div class="card-icon">
                  <Icon size={20} weight="regular" />
                </div>
                <span class="card-label">{cv.label}</span>
                <span class="card-dl">Download ↓</span>
              </a>
            {/each}
          </div>
        {/if}

        {#if resumeUrl}
          <div class="resume-row" class:has-border={cvs.length > 0}>
            {#if cvs.length > 0}<span class="resume-or">or</span>{/if}
            <a
              class="resume-btn"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Resume →
            </a>
          </div>
        {/if}
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
    width: min(540px, calc(100vw - 2rem));
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
    gap: 1.25rem;
  }

  .modal-desc {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
    margin: 0;
  }

  /* CV card grid */
  .cv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }

  .cv-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    padding: 1.375rem 0.875rem 1.125rem;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    text-align: center;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }
  .cv-card:hover { border-color: var(--accent); background: var(--bg-card-hover); }
  .cv-card:hover .card-dl { color: var(--accent); }

  .card-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }
  .cv-card:hover .card-icon { border-color: var(--accent); background: var(--bg-card-hover); }

  .card-label {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text);
    line-height: 1.35;
  }

  .card-dl {
    font-family: var(--font-body);
    font-size: 0.7rem;
    color: var(--text-muted);
    transition: color 0.15s ease;
  }

  /* Read Resume row */
  .resume-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
  }
  .resume-row.has-border {
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .resume-or {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .resume-btn {
    font-family: var(--font-heading);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .resume-btn:hover { color: var(--accent); }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
  }
</style>
