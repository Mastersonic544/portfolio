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

  let typingInterval;

  function triggerHaptic() {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (_) {
      // Fail silently
    }
  }

  // Periodic subtle haptic tick during the bot's loading/typing state
  $effect(() => {
    if (loading && open) {
      typingInterval = setInterval(() => {
        triggerHaptic();
      }, 700);
    } else {
      clearInterval(typingInterval);
    }
    return () => clearInterval(typingInterval);
  });

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
      
      // Create a bot message item with empty text
      const botMsgIndex = messages.length;
      messages = [...messages, { role: 'bot', text: '' }];
      
      // Type out character by character
      let currentText = '';
      for (let i = 0; i < reply.length; i++) {
        currentText += reply[i];
        messages[botMsgIndex].text = currentText;
        triggerHaptic();
        await tick();
        scrollToBottom();
        // Slightly randomized natural typing speed
        await new Promise(r => setTimeout(r, 12 + Math.random() * 12));
      }
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

<!-- Floating trigger (styled as a keyboard key, matching the portfolio.html Shift key style) -->
<button
  class="shift-key chat-trigger"
  onclick={openChat}
  aria-label="Open chat"
  aria-expanded={open}
>
  <span class="arrow">⇧</span>
  <span>Chat</span>
</button>

<!-- Chat modal -->
{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop" role="presentation" onclick={closeChat}></div>

  <div class="chat-modal" role="dialog" aria-label="Chat with Shift" tabindex="-1" onkeydown={onKeydown}>
    <!-- Header -->
    <div class="chat-header">
      <div class="header-left">
        <div class="chat-head-indicator"></div>
        <div class="header-text">
          <span class="chat-title">Ask the AI version of me</span>
          <span class="chat-disclaimer">CV and experience questions</span>
        </div>
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
          <div class="bubble {msg.role}">{msg.text}</div>
        </div>
      {/each}

      {#if loading && (!messages.length || messages[messages.length - 1].role !== 'bot' || messages[messages.length - 1].text === '')}
        <div class="bubble-wrap bot">
          <div class="bubble bot typing">
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
  /* Keyboard Shift key style styling for the trigger */
  .chat-trigger {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 200;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 96px;
    height: 44px;
    padding: 0 14px 0 12px;
    background: var(--key-face);
    color: var(--text);
    border: 1.5px solid var(--key-side);
    border-bottom-width: 4px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
    transition: transform 0.08s ease, border-bottom-width 0.08s ease,
                background 0.4s ease, border-color 0.4s ease, color 0.4s ease;
  }
  .chat-trigger:hover { background: var(--bg-card-hover); }
  .chat-trigger:active {
    transform: translateY(2px);
    border-bottom-width: 1.5px;
  }
  .chat-trigger .arrow {
    font-weight: 700;
    font-size: 13px;
    line-height: 1;
    transform: translateY(-1px);
  }
  .chat-trigger::after {
    content: "";
    position: absolute;
    bottom: 3px;
    left: 50%;
    width: 12px;
    height: 1.5px;
    background: var(--text);
    transform: translateX(-50%);
    opacity: 0.25;
    border-radius: 1px;
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
    height: min(500px, 85dvh);
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: 8px;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 16px 48px rgba(0, 0, 0, 0.14);
    overflow: hidden;
  }

  /* ── Header ─────────────────────────────────── */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 0.5px solid var(--border);
    background: var(--bg-card);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chat-head-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 0 var(--accent);
    animation: pulse-dot 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 92, 0, 0.45); }
    50%       { box-shadow: 0 0 0 8px rgba(255, 92, 0, 0); }
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chat-title {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--text);
  }

  .chat-disclaimer {
    font-family: var(--font-body);
    font-size: 10px;
    color: var(--text-muted);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 14px;
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s ease;
    flex-shrink: 0;
  }

  .close-btn:hover { color: var(--text); }

  /* ── Message list ───────────────────────────── */
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scroll-behavior: smooth;
    background: var(--bg-card);
  }

  .empty-hint {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
    margin: auto;
    padding: 2rem 0;
    line-height: 1.6;
  }

  .bubble-wrap {
    display: flex;
    width: 100%;
  }

  .bubble-wrap.user { justify-content: flex-end; }
  .bubble-wrap.bot  { justify-content: flex-start; }

  .bubble {
    max-width: 78%;
    padding: 10px 16px;
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
  }

  .bubble.user {
    background: var(--accent);
    color: #FFF;
    border-radius: 12px 12px 2px 12px;
  }

  .bubble.bot {
    background: var(--bg);
    color: var(--text);
    border-radius: 12px 12px 12px 2px;
    border: 0.5px solid var(--border);
  }

  /* ── Typing indicator ───────────────────────── */
  .bubble.typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
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
    border-top: 0.5px solid var(--border);
    background: var(--bg-card);
    flex-shrink: 0;
  }

  .input-row input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 14px 20px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
  }

  .input-row input::placeholder {
    color: var(--text-hint);
  }

  .input-row input:disabled { opacity: 0.5; }

  .send-btn {
    background: transparent;
    border: none;
    border-left: 0.5px solid var(--border);
    padding: 14px 20px;
    font-size: 16px;
    color: var(--accent);
    cursor: pointer;
    transition: background-color 0.15s ease, opacity 0.15s ease;
    line-height: 1;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) { background: var(--bg-card-hover); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 480px) {
    .chat-modal {
      width: calc(100vw - 3rem);
      right: 1.5rem;
    }
  }
</style>
