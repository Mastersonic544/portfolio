<script>
  import { onMount } from 'svelte';
  import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  /** @type {{ id: string; message: string; reply: string; timestamp: string }[]} */
  let logs    = $state([]);
  let loading = $state(true);

  /** @type {string | null} */
  let confirmDelete = $state(null);

  onMount(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'chatLogs'), orderBy('timestamp', 'desc'), limit(100))
      );
      logs = snap.docs.map(d => ({ id: d.id, .../** @type {any} */ (d.data()) }));
    } catch { /* silent */ }
    loading = false;
  });

  /** @param {string} id */
  async function deleteLog(id) {
    await deleteDoc(doc(db, 'chatLogs', id));
    logs = logs.filter(l => l.id !== id);
    confirmDelete = null;
  }

  /** @param {string} ts */
  function fmt(ts) {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
  }
</script>

<svelte:head>
  <title>Chat Logs — Shift Admin</title>
</svelte:head>

<div class="page">
  <h1 class="page-title">Chat Logs</h1>

  {#if loading}
    <p class="hint">Loading…</p>
  {:else if logs.length === 0}
    <p class="hint">No chat logs yet. Conversations will appear here after visitors use the chatbot.</p>
    <p class="hint" style="margin-top:0.5rem">Make sure Firestore has a rule: <code>match /chatLogs/&#123;doc&#125; &#123; allow write: if true; allow read: if request.auth != null; &#125;</code></p>
  {:else}
    <div class="log-list">
      {#each logs as log (log.id)}
        <div class="log-row">
          <div class="log-meta">
            <span class="log-time">{fmt(log.timestamp)}</span>
            {#if confirmDelete === log.id}
              <button class="act confirm-del" onclick={() => deleteLog(log.id)}>Confirm delete</button>
              <button class="act cancel"      onclick={() => (confirmDelete = null)}>Cancel</button>
            {:else}
              <button class="act delete" onclick={() => (confirmDelete = log.id)}>Delete</button>
            {/if}
          </div>
          <div class="bubble-pair">
            <div class="bubble user"><span class="bubble-label">User</span><p>{log.message}</p></div>
            <div class="bubble bot"><span class="bubble-label">Shift AI</span><p>{log.reply}</p></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.75rem; }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  .log-list { display: flex; flex-direction: column; gap: 0; }

  .log-row {
    padding: 1rem 0;
    border-bottom: 1px solid var(--bg-card);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .log-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .log-time {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .bubble-pair { display: flex; flex-direction: column; gap: 0.5rem; }

  .bubble {
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    max-width: 100%;
  }

  .bubble.user { background: var(--bg-card); }
  .bubble.bot  { background: transparent; border: 1px solid var(--bg-card); }

  .bubble-label {
    font-family: var(--font-body);
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .bubble p {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .act {
    background: transparent;
    border: 1px solid var(--bg-card);
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: 0.72rem;
    padding: 0.2rem 0.6rem;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
  }

  .act.delete:hover   { color: #e53e3e; border-color: #e53e3e; }
  .act.confirm-del    { background: #e53e3e; color: #fff; border-color: #e53e3e; }
  .act.cancel:hover   { color: var(--text); border-color: var(--text-muted); }

  .hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  code {
    font-size: 0.75rem;
    background: var(--bg-card);
    padding: 0.1rem 0.35rem;
    color: var(--accent);
  }
</style>
