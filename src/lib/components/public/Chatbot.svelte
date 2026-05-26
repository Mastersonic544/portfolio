<script>
  import { tick } from 'svelte';

  let open = $state(false);

  /** @typedef {{ role: 'user' | 'bot'; text: string }} Message */

  /** @type {Message[]} */
  let messages = $state([]);
  let input = $state('');
  let loading = $state(false);
  let inputEl = $state(null);

  /** @type {HTMLElement | null} */
  let listEl = $state(null);

  function openChat() {
    open = true;
    tick().then(() => inputEl?.focus());
  }

  function closeChat() {
    open = false;
  }

  /** @param {KeyboardEvent} e */
  function onKeydown(e) {
    if (e.key === 'Escape') closeChat();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    input = '';
    messages = [...messages, { role: 'user', text }];
    loading = true;

    await tick();
    scrollToBottom();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error('api-error');

      const { reply } = await res.json();
      messages = [...messages, { role: 'bot', text: reply }];
    } catch {
      messages = [...messages, { role: 'bot', text: "Something went wrong — try again in a moment." }];
    } finally {
      loading = false;
      await tick();
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }
</script>

<!-- Floating trigger -->
<button
  class="chat-trigger"
  onclick={openChat}
  aria-label="Open chat"
  aria-expanded={open}
>⇧</button>

<!-- Chat modal -->
{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop" role="presentation" onclick={closeChat}></div>

  <div class="chat-modal" role="dialog" aria-label="Chat with Shift" onkeydown={onKeydown}>
    <!-- Header -->
    <div class="chat-header">
      <div class="header-text">
        <span class="chat-title">Ask Shift anything</span>
        <span class="chat-disclaimer">Answers come from my actual CV and experience</span>
      </div>
      <button class="close-btn" onclick={closeChat} aria-label="Close chat">✕</button>
    </div>

    <!-- Message list -->
    <div class="message-list" bind:this={listEl}>
      {#if messages.length === 0}
        <p class="empty-hint">Ask me about my work, skills, availability, or services.</p>
      {/if}

      {#each messages as msg}
        <div class="bubble-wrap" class:user={msg.role === 'user'} class:bot={msg.role === 'bot'}>
          <div class="bubble">{msg.text}</div>
        </div>
      {/each}

      {#if loading}
        <div class="bubble-wrap bot">
          <div class="bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Input row -->
    <div class="input-row">
      <input
        bind:this={inputEl}
        bind:value={input}
        onkeydown={onKeydown}
        type="text"
        placeholder="Type a message…"
        disabled={loading}
      />
      <button class="send-btn" onclick={send} disabled={loading || !input.trim()}>
        →
      </button>
    </div>
  </div>
{/if}

<style>
  /* ── Trigger button (keyboard-key style, matches theme toggle) ── */
  .chat-trigger {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 200;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.1rem;
    line-height: 1;
    background: var(--bg);
    color: var(--text);
    border: 1.5px solid var(--text-muted);
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    box-shadow: 0 2.5px 0 var(--text-muted);
    cursor: pointer;
    user-select: none;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.08s ease,
      transform 0.08s ease;
  }

  .chat-trigger:active {
    transform: translateY(2px);
    box-shadow: none;
  }

  /* ── Backdrop ───────────────────────────────── */
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 299;
  }

  /* ── Chat modal ─────────────────────────────── */
  .chat-modal {
    position: fixed;
    bottom: 5.5rem;
    right: 1.5rem;
    z-index: 300;
    width: 360px;
    height: 500px;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border: 1px solid var(--bg-card);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 16px 48px rgba(0, 0, 0, 0.14);
    overflow: hidden;
  }

  /* ── Header ─────────────────────────────────── */
  .chat-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.125rem 1.25rem 1rem;
    border-bottom: 1px solid var(--bg-card);
    flex-shrink: 0;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .chat-title {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .chat-disclaimer {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.1rem 0.25rem;
    line-height: 1;
    transition: color 0.15s ease;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .close-btn:hover { color: var(--text); }

  /* ── Message list ───────────────────────────── */
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    scroll-behavior: smooth;
  }

  .empty-hint {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
    text-align: center;
    margin: auto;
    padding: 2rem 0;
    line-height: 1.6;
  }

  .bubble-wrap {
    display: flex;
  }

  .bubble-wrap.user { justify-content: flex-end; }
  .bubble-wrap.bot  { justify-content: flex-start; }

  .bubble {
    max-width: 78%;
    padding: 0.55rem 0.875rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.55;
    word-break: break-word;
  }

  .bubble-wrap.user .bubble {
    background: var(--accent);
    color: #fff;
  }

  .bubble-wrap.bot .bubble {
    background: var(--bg-card);
    color: var(--text);
  }

  /* ── Typing indicator ───────────────────────── */
  .bubble.typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.65rem 0.875rem;
  }

  .bubble.typing span {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    animation: bounce 1.1s infinite ease-in-out;
  }

  .bubble.typing span:nth-child(2) { animation-delay: 0.18s; }
  .bubble.typing span:nth-child(3) { animation-delay: 0.36s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40%            { transform: translateY(-5px); opacity: 1; }
  }

  /* ── Input row ──────────────────────────────── */
  .input-row {
    display: flex;
    align-items: center;
    gap: 0;
    border-top: 1px solid var(--bg-card);
    flex-shrink: 0;
  }

  .input-row input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.875rem 1.25rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--text);
  }

  .input-row input::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .input-row input:disabled { opacity: 0.5; }

  .send-btn {
    background: transparent;
    border: none;
    border-left: 1px solid var(--bg-card);
    padding: 0.875rem 1.125rem;
    font-size: 1rem;
    color: var(--accent);
    cursor: pointer;
    transition: background-color 0.15s ease, opacity 0.15s ease;
    line-height: 1;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) { background: var(--bg-card); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 480px) {
    .chat-modal {
      width: calc(100vw - 3rem);
      right: 1.5rem;
    }
  }
</style>
