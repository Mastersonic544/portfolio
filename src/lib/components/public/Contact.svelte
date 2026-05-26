<script>
  import { onMount } from 'svelte';
  import { LinkedinLogo, GithubLogo } from 'phosphor-svelte';
  import { logClick } from '$lib/utils/analytics.js';

  onMount(() => logClick('contact'));

  // TODO: Replace # with actual profile URLs
  const socials = [
    { label: 'LinkedIn', href: '#', Icon: LinkedinLogo },
    { label: 'GitHub',   href: '#', Icon: GithubLogo }
  ];

  let name      = $state('');
  let email     = $state('');
  let subject   = $state('');
  let message   = $state('');
  let submitting = $state(false);
  let sent       = $state(false);
  let formError  = $state(false);

  async function handleSubmit(/** @type {SubmitEvent} */ e) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    formError = false;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      if (res.ok) {
        sent = true;
        name = email = subject = message = '';
      } else {
        formError = true;
      }
    } catch {
      formError = true;
    } finally {
      submitting = false;
    }
  }
</script>

<section class="contact" id="contact">
  <div class="layout">

    <!-- Left: info + socials -->
    <div class="info-col">
      <span class="section-label">Contact</span>
      <h2 class="section-title">Get in Touch</h2>
      <p class="subtitle">I'm usually quick to reply — let's start a conversation.</p>

      <div class="socials">
        {#each socials as { label, href, Icon }}
          <a class="social-link" {href} target="_blank" rel="noopener noreferrer">
            <Icon size={18} weight="regular" />
            <span>{label}</span>
          </a>
        {/each}
      </div>
    </div>

    <!-- Right: form -->
    <div class="form-col">
      {#if sent}
        <div class="success-state">
          <p class="success-msg">Message sent — I'll get back to you soon.</p>
          <button class="reset-btn" onclick={() => (sent = false)}>Send another</button>
        </div>
      {:else}
        <form onsubmit={handleSubmit} novalidate>
          <div class="field">
            <label for="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              bind:value={name}
              required
              autocomplete="name"
              placeholder="Your name"
            />
          </div>

          <div class="field">
            <label for="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              bind:value={email}
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div class="field">
            <label for="contact-subject">Subject</label>
            <input
              id="contact-subject"
              type="text"
              name="subject"
              bind:value={subject}
              required
              placeholder="What's it about?"
            />
          </div>

          <div class="field">
            <label for="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              bind:value={message}
              required
              placeholder="Tell me more..."
            ></textarea>
          </div>

          {#if formError}
            <p class="error-msg">Something went wrong. Try again or email me directly.</p>
          {/if}

          <button type="submit" class="submit-btn" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      {/if}
    </div>

  </div>
</section>

<style>
  .contact {
    padding: 7rem 5vw 5rem;
    background-color: var(--bg-card);
    color: var(--text);
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 5rem;
    align-items: start;
  }

  /* ── Info column ────────────────────────────── */
  .section-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 0.875rem;
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--text-muted);
    margin-bottom: 2rem;
  }

  .socials {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .social-link:hover { color: var(--accent); }

  /* ── Form column ────────────────────────────── */
  form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .field label {
    font-family: var(--font-body);
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .field input,
  .field textarea {
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--text-muted);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.9rem;
    padding: 0.5rem 0;
    width: 100%;
    outline: none;
    transition: border-color 0.2s ease;
    resize: vertical;
  }

  .field input::placeholder,
  .field textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.5;
  }

  .field input:focus,
  .field textarea:focus {
    border-bottom-color: var(--accent);
  }

  .field textarea {
    min-height: 120px;
    line-height: 1.65;
  }

  .submit-btn {
    align-self: flex-start;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.875rem 2.25rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) { opacity: 0.88; }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-msg {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: #e53e3e;
  }

  /* ── Success state ──────────────────────────── */
  .success-state {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2.5rem 0;
  }

  .success-msg {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .reset-btn {
    background: transparent;
    border: none;
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--accent);
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    align-self: flex-start;
  }

  /* ── Mobile ─────────────────────────────────── */
  @media (max-width: 768px) {
    .contact { padding: 5rem 1.5rem 3rem; }
    .layout {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }
</style>
