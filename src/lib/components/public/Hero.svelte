<script>
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import gsap from 'gsap';
  import { collection, getDocs, query, where, limit } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';
  import { theme } from '$lib/stores/theme.js';
  import { logClick } from '$lib/utils/analytics.js';
  import CvModal from './CvModal.svelte';

  const roles = ['Graphic Designer', 'Video Editor', 'Web Developer', 'Mobile Developer', 'Full Stack Developer', 'Creative Technologist', 'UI/UX Designer'];

  let kpis           = $state([]);
  let companies      = $state([]);
  let biography      = $state('');
  let contactLocation = $state('');
  let contactEmail   = $state('');
  let contactPhone   = $state('');
  let services       = $state([]);
  let loaded         = $state(false);
  let cvOpen         = $state(false);

  /** @type {HTMLElement} */
  let heroEl;
  let currentRoleText = $state(roles[0]);
  let isMounted  = true;
  let heroInView = false;

  function toggleTheme() {
    theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  function triggerHaptic() {
    if (!heroInView) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (_) { /* silent */ }
  }

  async function startRoleTypewriter() {
    let roleIdx = 0;
    while (isMounted) {
      let targetWord = roles[roleIdx];
      
      // Type out
      for (let i = 0; i <= targetWord.length; i++) {
        if (!isMounted) return;
        currentRoleText = targetWord.slice(0, i);
        triggerHaptic();
        await new Promise(r => setTimeout(r, 80));
      }
      
      // Pause on full word
      for (let p = 0; p < 20; p++) {
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 100));
      }
      
      // Backspace
      for (let i = targetWord.length; i >= 0; i--) {
        if (!isMounted) return;
        currentRoleText = targetWord.slice(0, i);
        triggerHaptic();
        await new Promise(r => setTimeout(r, 45));
      }
      
      // Short pause
      for (let p = 0; p < 4; p++) {
        if (!isMounted) return;
        await new Promise(r => setTimeout(r, 100));
      }
      
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }

  function runCountUps() {
    heroEl?.querySelectorAll('[data-count-target]').forEach(el => {
      const target = parseInt(/** @type {HTMLElement} */ (el).dataset.countTarget, 10);
      const proxy  = { val: 0 };
      gsap.to(proxy, {
        val: target, duration: 1.8, ease: 'power2.out', delay: 0.35,
        onUpdate() { el.textContent = Math.round(proxy.val).toString(); }
      });
    });
  }

  onMount(async () => {
    logClick('hero');
    const unsub = theme.subscribe(v => document.documentElement.setAttribute('data-theme', v));

    // Haptic only fires when hero is visible
    const observer = new IntersectionObserver(
      ([entry]) => { heroInView = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(heroEl);

    // Physical Shift key (standalone press, no other modifier) → toggle theme
    let shiftOnly = false;
    function onKeydown(/** @type {KeyboardEvent} */ e) {
      if (e.key === 'Shift' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        shiftOnly = true;
      } else {
        shiftOnly = false;
      }
    }
    function onKeyup(/** @type {KeyboardEvent} */ e) {
      if (e.key === 'Shift' && shiftOnly) {
        toggleTheme();
        shiftOnly = false;
      }
    }
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup',   onKeyup);

    try {
      const snap = await getDocs(
        query(collection(db, 'sections'), where('name', '==', 'hero'), limit(1))
      );
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.kpis?.length)      kpis      = data.kpis;
        if (data.companies?.length) companies = data.companies;
        if (data.services?.length)  services  = data.services;
        if (data.content) {
          biography       = data.content.biography        ?? '';
          contactLocation = data.content.contact_location ?? '';
          contactEmail    = data.content.contact_email    ?? '';
          contactPhone    = data.content.contact_phone    ?? '';
        }
      }
    } catch (_) { /* silent */ }

    loaded = true;
    await tick();
    runCountUps();
    startRoleTypewriter();

    return () => {
      isMounted = false;
      observer.disconnect();
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('keyup',   onKeyup);
      unsub();
    };
  });
</script>

<button class="shift-key theme-toggle" onclick={toggleTheme} aria-label="Toggle dark mode" title="Press ⇧ — toggles the lights">
  <span class="arrow">⇧</span>
  <span>Shift</span>
</button>

<CvModal open={cvOpen} onclose={() => (cvOpen = false)} />

<section class="hero" bind:this={heroEl}>
  <!-- Ghost Watermark -->
  <div class="ghost" aria-hidden="true">YD</div>

  <div class="hero-header">
    <div class="eyebrow">
      <span class="index">№ 23</span>
      <span>Yassine Dhouib · b. 2003 · Sfax, TN</span>
      <span class="dot" aria-hidden="true"></span>
    </div>
    
    <h1 class="headline" aria-label="Yassine Dhouib">
      <span class="row"><span class="inner">Yassine Dhouib</span></span>
    </h1>
    
    <p class="lede">
      Based in Sfax, Tunisia &nbsp;·&nbsp; <span class="role-animated">{currentRoleText}</span><span class="cursor" aria-hidden="true"></span>
    </p>
  </div>

  {#if loaded}
  <div class="columns">

    <div class="info-col">
      {#if biography}
      <div class="info-block">
        <span class="block-label">Biography</span>
        <p class="block-text">{biography}</p>
      </div>
      {/if}

      {#if contactLocation || contactEmail || contactPhone}
      <div class="info-block">
        <span class="block-label">Contact</span>
        <div class="block-text">
          {#if contactLocation}<p>{contactLocation}</p>{/if}
          {#if contactEmail}<a href="mailto:{contactEmail}" class="contact-link">{contactEmail}</a>{/if}
          {#if contactPhone}<a href="tel:{contactPhone.replace(/\s/g,'')}" class="contact-link">{contactPhone}</a>{/if}
        </div>
      </div>
      {/if}

      <div class="hero-cta-row">
        <a class="hero-btn hero-btn-primary" href="#contact">Get in touch</a>
        <button class="hero-btn hero-btn-outline" onclick={() => (cvOpen = true)}>Download CV</button>
      </div>

      {#if services.length}
      <div class="info-block">
        <span class="block-label">Services</span>
        <div class="block-text">
          {#each services as svc}<p>{svc}</p>{/each}
        </div>
      </div>
      {/if}
    </div>

    <div class="photo-col">
      <div class="portrait-stack">
        <span class="portrait-meta">Sfax, Tunisia — Self-portrait, 2024</span>
        <div class="portrait">
          <img src="/images/profile/hero.webp" alt="Yassine Dhouib" />
        </div>
      </div>
    </div>

    <div class="kpi-col">
      {#each kpis as kpi}
        <div class="kpi">
          <div class="value">
            <span data-count-target={kpi.num}>0</span>
            <span class={kpi.suffix === '×' ? 'times' : 'plus'}>{kpi.suffix}</span>
          </div>
          <div class="label">{kpi.label}</div>
        </div>
      {/each}
    </div>

  </div>

  {#if companies.length}
  <div class="bottom">
    <hr class="divider" />
    <div class="ticker-wrap">
      <div class="ticker-track">
        {#each [...companies, ...companies, ...companies] as co}
          <div class="company-logo">
            <img src={co.url} alt={co.name} />
          </div>
        {/each}
      </div>
    </div>
  </div>
  {/if}
  {/if}
</section>

<style>
  /* Shift Key Dark Mode Toggle styling from portfolio.html */
  .theme-toggle {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
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
  .theme-toggle:hover { background: var(--bg-card-hover); }
  .theme-toggle:active {
    transform: translateY(2px);
    border-bottom-width: 1.5px;
  }
  .theme-toggle .arrow {
    font-weight: 700;
    font-size: 13px;
    line-height: 1;
    transform: translateY(-1px);
  }
  /* tiny embossed indicator dot */
  .theme-toggle::after {
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

  .hero {
    position: relative;
    min-height: 100vh;
    background-color: var(--bg);
    color: var(--text);
    padding: 7rem 60px 4rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    overflow: hidden;
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  /* Ghost watermark styling */
  .ghost {
    position: absolute;
    left: -2vw;
    bottom: -10vw;
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 44vw;
    line-height: 0.78;
    letter-spacing: -0.06em;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--border);
    pointer-events: none;
    z-index: 0;
    user-select: none;
    transition: -webkit-text-stroke-color 0.4s ease;
    animation: ghost-in 1.6s ease 0.2s both;
  }

  .hero-header {
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px 14px;
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 12px;
    animation: fade-up 0.7s ease 0.15s both;
  }
  .eyebrow .index {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 12px;
    color: var(--text);
    letter-spacing: 0;
  }
  .eyebrow .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 0 var(--accent);
    animation: pulse-dot 2.4s ease-in-out infinite;
  }

  .headline {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(2.4rem, 5.5vw, 5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0;
    color: var(--text);
  }
  .headline .row {
    display: block;
    overflow: hidden;
  }
  .headline .inner {
    display: inline-block;
    transform: translateY(110%);
    animation: rise 0.95s cubic-bezier(0.2, 0.85, 0.2, 1) both;
  }
  .headline .row:nth-child(1) .inner { animation-delay: 0.30s; }

  .lede {
    margin: 12px 0 0;
    font-family: var(--font-body);
    font-weight: 300;
    font-size: 17px;
    line-height: 1.7;
    color: var(--text-muted);
    animation: fade-up 0.8s ease 1.0s both;
  }
  .role-animated {
    font-weight: 500;
    border-bottom: 1.5px solid var(--accent);
    padding-bottom: 1px;
    color: var(--text);
  }
  .cursor {
    display: inline-block;
    width: 0.085em;
    height: 0.78em;
    background: var(--accent);
    margin-left: 0.06em;
    transform: translateY(0.02em);
    animation: blink-cursor 1.05s steps(2) infinite;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 380px 1fr;
    grid-template-areas: 'left photo right';
    align-items: center;
    gap: 2rem 3rem;
    flex: 1;
    position: relative;
    z-index: 2;
  }

  .info-col {
    grid-area: left;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    animation: fade-up 0.8s ease 0.8s both;
  }

  .info-block {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .block-label {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--text-muted);
  }

  .block-text {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.7;
    color: var(--text);
    margin: 0;
  }
  .block-text p { margin: 0; }

  .contact-link {
    display: block;
    color: var(--text);
    text-decoration: none;
    font-size: 15px;
    line-height: 1.7;
    transition: color 0.15s ease;
  }
  .contact-link:hover { color: var(--accent); }

  .hero-cta-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .hero-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  }
  .hero-btn-primary { background: var(--accent); color: #fff; }
  .hero-btn-primary:hover { opacity: 0.88; }
  .hero-btn-outline { background: transparent; border: 1.5px solid var(--text-muted); color: var(--text); }
  .hero-btn-outline:hover { border-color: var(--text); }

  .photo-col {
    grid-area: photo;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Portrait Stack Styling from portfolio.html */
  .portrait-stack {
    position: relative;
    width: 100%;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
    animation: portrait-in 1.0s cubic-bezier(0.34, 1.56, 0.64, 1) 0.65s both;
  }
  @keyframes portrait-in {
    from { opacity: 0; transform: translateY(28px) scale(0.94) rotate(-1.5deg); }
    to   { opacity: 1; transform: translateY(0) scale(1) rotate(-2deg); }
  }
  .portrait {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: 50% / 40%;
    overflow: hidden;
    background: var(--bg-card);
    border: 2px solid var(--accent);
    transform: rotate(0deg);
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 1;
  }
  .portrait:hover { transform: scale(1.02) rotate(1deg); }
  .portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 22%;
    filter: saturate(0.92) contrast(1.02);
  }
  /* Offset accent outline behind portrait */
  .portrait-stack::before {
    content: "";
    position: absolute;
    inset: 0;
    transform: translate(-14px, 14px) rotate(-2deg);
    border: 1.5px solid var(--accent);
    border-radius: 50% / 40%;
    z-index: 0;
    opacity: 0.7;
  }

  .portrait-meta {
    position: absolute;
    left: -40px;
    top: 12%;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
    z-index: 2;
  }
  .portrait-meta::before {
    content: "";
    display: inline-block;
    width: 1px;
    height: 24px;
    background: var(--accent);
    margin-right: 14px;
    vertical-align: middle;
  }

  .kpi-col {
    grid-area: right;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: flex-start;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fade-up 0.7s ease both;
  }
  .kpi:nth-child(1) { animation-delay: 1.1s; }
  .kpi:nth-child(2) { animation-delay: 1.2s; }
  .kpi:nth-child(3) { animation-delay: 1.3s; }
  .kpi:nth-child(4) { animation-delay: 1.4s; }
  .kpi:nth-child(5) { animation-delay: 1.5s; }

  .kpi .value {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(40px, 4.4vw, 68px);
    letter-spacing: -0.04em;
    line-height: 0.95;
    color: var(--text);
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  .kpi .plus, .kpi .times {
    color: var(--accent);
    font-size: 0.55em;
    transform: translateY(-0.05em);
    margin-left: 2px;
  }
  .kpi .label {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 10.5px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .bottom {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    position: relative;
    z-index: 2;
    animation: fade-up 0.8s ease 1.2s both;
  }

  .divider {
    border: none;
    height: 1px;
    background-color: var(--border);
  }

  .ticker-wrap {
    overflow: hidden;
    width: 100%;
    mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
  }

  .ticker-track {
    display: flex;
    align-items: center;
    gap: 4rem;
    width: max-content;
    animation: ticker-scroll 14s linear infinite;
  }
  .ticker-wrap:hover .ticker-track {
    animation-play-state: paused;
  }

  @keyframes ticker-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-33.333%); }
  }

  .company-logo {
    height: 28px;
    flex-shrink: 0;
    opacity: 0.4;
    filter: grayscale(1);
    transition: opacity 0.25s ease, filter 0.25s ease;
  }
  .company-logo:hover {
    opacity: 0.8;
    filter: grayscale(0);
  }
  .company-logo img {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }

  @media (max-width: 900px) {
    .hero {
      padding: 6rem 24px 36px;
    }
    .columns {
      grid-template-columns: 1fr;
      grid-template-areas: 'photo' 'left' 'right';
      gap: 2rem 0;
    }
    .portrait-stack {
      max-width: 260px;
      margin: 0 auto;
    }
    .portrait-meta {
      left: -28px;
    }
    .info-col {
      gap: 1.75rem;
    }
    .kpi-col {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px 0;
      width: 100%;
    }
    .kpi {
      padding-left: 16px !important;
      border-left: 1px solid var(--border);
    }
    .kpi:nth-child(odd) {
      padding-left: 0 !important;
      border-left: 0;
    }
    .ghost {
      font-size: 78vw;
      bottom: -14vw;
    }
  }

  @media (max-width: 480px) {
    .hero {
      padding: 5rem 1.25rem 3rem;
      gap: 2.5rem;
    }
    .portrait-stack {
      max-width: 220px;
    }
    .ticker-track {
      gap: 2.5rem;
    }
    /* Hide decorative vertical text at very narrow widths to avoid clipping */
    .portrait-meta { display: none; }
  }

  @media (max-width: 360px) {
    .hero { padding: 4.5rem 1rem 2.5rem; }
    .kpi .value { font-size: 36px; }
  }
</style>
