<script>
  // Footer links pointing to Yassine's official profiles
</script>

<footer class="footer">
  <div class="footer-top">
    <p class="footer-statement">Built, not <em>bought.</em></p>
    <nav class="footer-links" aria-label="Elsewhere">
      <a href="https://github.com/Mastersonic544" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.linkedin.com/in/yassine-dhouib-798092266/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://read.cv" target="_blank" rel="noopener noreferrer">Read.cv</a>
      <a href="mailto:yassine.m.dhouib@gmail.com">Email</a>
    </nav>
  </div>
  <p class="footer-mark" aria-hidden="true">YD</p>
  <div class="footer-meta">
    <span>© Y. Dhouib 2026 — Sfax, TN</span>
    <span>Hand-coded · No frameworks · No invoices</span>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    z-index: 2;
    padding: 80px 60px 32px;
    border-top: 1px solid var(--border);
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    transition: background-color 0.4s ease, color 0.4s ease;
  }
  
  .footer-top {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 40px;
    margin-bottom: 64px;
    position: relative;
    z-index: 3;
  }
  
  .footer-statement {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(28px, 6vw, 88px);
    letter-spacing: -0.035em;
    line-height: 0.95;
    margin: 0;
  }
  .footer-statement em {
    font-style: normal;
    color: var(--accent);
  }
  
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: right;
  }
  
  .footer-links a {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.01em;
    color: var(--text);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    transition: color 0.2s ease, gap 0.2s ease;
  }
  .footer-links a::after {
    content: "↗";
    color: var(--text-muted);
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .footer-links a:hover {
    color: var(--accent);
    gap: 16px;
  }
  .footer-links a:hover::after {
    color: var(--accent);
    transform: translate(2px, -2px);
  }
  
  .footer-mark {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(160px, 30vw, 380px);
    letter-spacing: -0.06em;
    line-height: 0.8;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--border);
    margin: 0 0 -0.18em;
    user-select: none;
    position: relative;
    z-index: 1;
    transition: -webkit-text-stroke-color 0.4s ease;
  }
  
  .footer-meta {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
    position: relative;
    z-index: 3;
  }

  @media (max-width: 900px) {
    .footer {
      padding: 56px 24px 24px;
    }
    .footer-top {
      grid-template-columns: 1fr;
      margin-bottom: 40px;
    }
    .footer-links {
      text-align: left;
    }
    .footer-links a {
      justify-content: flex-start;
    }
  }

  @media (max-width: 480px) {
    .footer { padding: 40px 16px 20px; }
    .footer-top { margin-bottom: 24px; }
    .footer-links a { font-size: 18px; }
  }
</style>
