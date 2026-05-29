<script>
  import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
  import { db } from '$lib/firebase.js';

  /** @param {string} str */
  function slugify(str) {
    return str.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const ALL_PROJECTS = [
    {
      title: 'Personal Website',
      slug: 'personal-website',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'React'],
      description: 'A responsive portfolio website showcasing skills and experience.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript', 'React JS'],
      kpis: [],
      status: 'Live',
      links: {},
    },
    {
      title: 'Automation System',
      slug: 'automation-system',
      category: 'dev',
      tags: ['Python', 'Node.js', 'Automation'],
      description: 'An automation system for streamlining business processes.',
      article: '',
      stack: ['Python', 'Node JS', 'Express JS'],
      kpis: [],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Cleaning Products Business Management Software',
      slug: 'cleaning-products-management',
      category: 'dev',
      tags: ['Python', 'Desktop App', 'Automation', 'Web Scraping'],
      description: 'Python/Tkinter desktop software for cleaning product manufacturers. Includes a lab section that scrapes chemical data, prices, and supplier information.',
      article: '',
      stack: ['Python', 'Tkinter', 'Web Scraping'],
      kpis: [{ label: 'Model', value: 'One-time purchase' }, { label: 'Modules', value: 'Modular paid' }],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Artist-Focused Mobile Application',
      slug: 'artist-mobile-app',
      category: 'dev',
      tags: ['Mobile', 'UI/UX', 'App Design', 'Monetization'],
      description: 'A mobile application designed for artists with integrated non-intrusive ad monetization and creative-focused features.',
      article: '',
      stack: ['UI/UX Design', 'App Development'],
      kpis: [{ label: 'Target', value: 'Creative users' }],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Randev Booking System',
      slug: 'randev-booking-system',
      category: 'dev',
      tags: ['Web Development', 'UI/UX', 'Animation', 'Booking'],
      description: 'Booking system for local businesses like hair salons and car washes, with branded marketing materials and animated Eid-themed promotional content.',
      article: '',
      stack: ['Web Development', 'Animation', 'UI/UX Design'],
      kpis: [{ label: 'Business types', value: '2+' }],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Container Housing Business Concept',
      slug: 'container-housing-concept',
      category: 'pfe',
      tags: ['Business Planning', 'Sustainability', 'Research'],
      description: 'Business model for recycling shipping containers into affordable housing, reducing CO2 emissions, water consumption, and build times.',
      article: '',
      stack: [],
      kpis: [{ label: 'CO2 reduction', value: 'Significant' }],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Low-Cost 3D Printer Conversion',
      slug: 'low-cost-3d-printer',
      category: 'dev',
      tags: ['Arduino', 'ESP32', 'IoT', '3D Printing', 'Hardware'],
      description: 'Engineering project converting a 3D pen into a low-cost smartphone-controlled 3D printer using Arduino-compatible hardware and an ESP32-CAM.',
      article: '',
      stack: ['Arduino', 'ESP32-CAM', 'Mechanical Design', '3D Printing'],
      kpis: [{ label: 'Cost', value: 'Low-cost' }, { label: 'Control', value: 'Smartphone' }],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Discord Moderation Automation',
      slug: 'discord-moderation-automation',
      category: 'dev',
      tags: ['Automation', 'Scripting', 'Discord'],
      description: 'AutoHotkey automation script for Discord moderation workflows, automating repetitive responses and moderation shortcuts.',
      article: '',
      stack: ['AutoHotkey'],
      kpis: [],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'English 101 Learning Platform',
      slug: 'english-101-platform',
      category: 'dev',
      tags: ['Web Development', 'EdTech', 'Education'],
      description: 'Educational platform for English language learning with quizzes and interactive content.',
      article: '',
      stack: ['Web Development', 'Educational Technology'],
      kpis: [],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Coffee Shop Mobile App',
      slug: 'coffee-shop-app',
      category: 'dev',
      tags: ['Mobile', 'UI/UX', 'App Design', 'Branding'],
      description: 'Custom-themed coffee shop app inspired by the business branding and mascots, with a built-in mini-game for customer engagement.',
      article: '',
      stack: ['UI/UX Design', 'App Development'],
      kpis: [],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'Robotics & Programming Education Content',
      slug: 'robotics-education-content',
      category: 'digital',
      tags: ['Branding', 'Content Creation', 'Social Media', 'Design'],
      description: 'Digital content and branding work for local robotics and programming education centers in Tunisia.',
      article: '',
      stack: [],
      kpis: [],
      status: 'Case Study',
      links: {},
    },
    {
      title: 'CV Maker',
      slug: 'cv-maker',
      category: 'dev',
      tags: ['Python', 'React', 'AI', 'Automation', 'FastAPI'],
      description: 'Local AI-powered job application platform. Discovers LinkedIn listings, generates hyper-tailored CVs and cover letters via an LLM loop, auto-applies via Playwright, and provides a persona-driven interview simulator.',
      article: '',
      stack: ['Python', 'FastAPI', 'React', 'JavaScript', 'Tailwind CSS', 'Playwright', 'OpenRouter API'],
      kpis: [{ label: 'Model', value: 'GAN-style LLM loop' }],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/CV-maker' },
    },
    {
      title: 'EduLink',
      slug: 'edulink',
      category: 'dev',
      tags: ['TypeScript', 'Social Network', 'EdTech'],
      description: 'Professional network platform for educators to connect and collaborate based on their pedagogical teaching approaches.',
      article: '',
      stack: ['TypeScript'],
      kpis: [],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/EduLink' },
    },
    {
      title: 'Princess – Love Quote Reels',
      slug: 'princess-love-quote-reels',
      category: 'dev',
      tags: ['TypeScript', 'Web App', 'Creative'],
      description: 'TikTok-style infinite-scroll web app that generates and displays personalized love quote reels.',
      article: '',
      stack: ['TypeScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/princess' },
    },
    {
      title: 'Resty – Eye Rest App',
      slug: 'resty-eye-rest-app',
      category: 'dev',
      tags: ['Flutter', 'Dart', 'Mobile', 'Health'],
      description: 'Flutter mobile app that guides users through the 20-20-20 eye rest method to reduce screen-induced eye strain.',
      article: '',
      stack: ['Flutter', 'Dart'],
      kpis: [{ label: 'Method', value: '20-20-20 rule' }],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/Resty_app' },
    },
    {
      title: 'Media Resolution Viewer',
      slug: 'media-resolution-viewer',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Web App'],
      description: 'Web app for displaying media content with a selectable quality resolution picker from 144p to 1080p.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/another-other-cute-one' },
    },
    {
      title: 'Malloulinova – B2B IoT Consulting Platform',
      slug: 'malloulinova',
      category: 'dev',
      tags: ['React', 'Firebase', 'Supabase', 'IoT', 'AI', 'PostgreSQL'],
      description: 'Full-stack B2B IoT consulting platform with article management, multi-tag project filtering, Groq-powered AI chatbot for lead qualification, real-time visitor analytics with click heatmaps, and an admin dashboard.',
      article: '',
      stack: ['React', 'TypeScript', 'Firebase', 'Supabase', 'Express JS', 'Groq API', 'PostgreSQL'],
      kpis: [{ label: 'AI feature', value: 'Lead qualification chatbot' }, { label: 'Analytics', value: 'Click heatmaps' }],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/malloulinova-test' },
    },
    {
      title: 'Public Police – Civic Infraction Reporting',
      slug: 'public-police',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Web App', 'Civic Tech'],
      description: 'Web app enabling citizens to report minor infractions with evidence. Admins can view, filter, approve, or reject reports via a dashboard. Includes light/dark theme and localStorage persistence.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/project-web' },
    },
    {
      title: "Don't Shift – Focus Timer",
      slug: 'dont-shift-focus-timer',
      category: 'dev',
      tags: ['TypeScript', 'Desktop', 'Productivity'],
      description: 'Desktop focus timer and task management application to help users maintain deep work and reduce context switching.',
      article: '',
      stack: ['TypeScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/dont-shift' },
    },
    {
      title: 'Hackathon Project',
      slug: 'hackathon-project',
      category: 'dev',
      tags: ['Java', 'TypeScript', 'HTML', 'CSS', 'Hackathon'],
      description: 'Full-stack hackathon submission with a Java/TypeScript backend and HTML/CSS frontend, built competitively at the Shifters programming event.',
      article: '',
      stack: ['Java', 'TypeScript', 'HTML', 'CSS'],
      kpis: [{ label: 'Event', value: 'Shifters 2024' }, { label: 'Result', value: '1st place' }],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/project-hackathon' },
    },
    {
      title: 'LibRent – Library Rental System',
      slug: 'librent',
      category: 'dev',
      tags: ['JavaScript', 'Web App'],
      description: 'Web-based library book rental management system.',
      article: '',
      stack: ['JavaScript'],
      kpis: [],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/librent' },
    },
    {
      title: 'Iyed Colab Rental System',
      slug: 'iyed-colab-rental',
      category: 'dev',
      tags: ['PHP', 'Web App'],
      description: 'PHP-based rental management web application built for the Iyed Colab workspace.',
      article: '',
      stack: ['PHP'],
      kpis: [],
      status: 'Case Study',
      links: { github: 'https://github.com/Mastersonic544/iyed-colab-rent' },
    },
    {
      title: 'Shiftewi – Student Tools & Games',
      slug: 'shiftewi',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Games', 'Tools'],
      description: 'Website offering a collection of useful tools and browser games for students.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/shiftewi' },
    },
    {
      title: 'Chessewi – Browser Chess Game',
      slug: 'chessewi',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Game'],
      description: 'Proof-of-concept browser chess game with a 5×6 grid, Unicode piece rendering, and click-to-move interaction.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [{ label: 'Grid', value: '5×6' }],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/chessewi' },
    },
    {
      title: 'Rush It – Pomodoro Timer',
      slug: 'rush-it',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Productivity'],
      description: 'Web-based Pomodoro timer for focused work sessions and time management.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/rush-it-web' },
    },
    {
      title: 'Sabboura – Web Whiteboard',
      slug: 'sabboura',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
      description: 'Browser-based digital whiteboard for freehand drawing and note-taking.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/sabboura' },
    },
    {
      title: 'Chkobba Score Counter',
      slug: 'chkobba-score',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'Game', 'Tunisia'],
      description: 'Web-based score tracker for Chkobba, the traditional Tunisian card game.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/Chkobba-Score-Counter' },
    },
    {
      title: 'Iyed Coffee Menu',
      slug: 'iyed-coffee',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript'],
      description: 'Digital coffee menu web app for the Iyed Colab space.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/Iyed_Coffee' },
    },
    {
      title: 'PokDex – Pokédex App',
      slug: 'pokdex',
      category: 'dev',
      tags: ['HTML', 'CSS', 'JavaScript', 'API'],
      description: 'Simple browser-based Pokédex for browsing and looking up Pokémon data.',
      article: '',
      stack: ['HTML', 'CSS', 'JavaScript'],
      kpis: [],
      status: 'Live',
      links: { github: 'https://github.com/Mastersonic544/pok-dex' },
    },
  ];

  /** @type {'idle' | 'checking' | 'seeding' | 'done' | 'error'} */
  let status     = $state('idle');
  let seeded     = $state(0);
  let skipped    = $state(0);
  let errorMsg   = $state('');
  let toSeed     = $state(/** @type {typeof ALL_PROJECTS} */ ([]));
  let confirmed  = $state(false);

  async function prepare() {
    status = 'checking';
    try {
      const snap = await getDocs(collection(db, 'projects'));
      const existingSlugs = new Set(snap.docs.map(d => /** @type {any} */ (d.data()).slug));
      toSeed  = ALL_PROJECTS.filter(p => !existingSlugs.has(p.slug));
      skipped = ALL_PROJECTS.length - toSeed.length;
      status  = 'idle';
      confirmed = true;
    } catch (e) {
      errorMsg = String(e);
      status = 'error';
    }
  }

  async function seed() {
    if (!toSeed.length) return;
    status = 'seeding';
    try {
      const batch = writeBatch(db);
      for (const project of toSeed) {
        const ref = doc(collection(db, 'projects'));
        batch.set(ref, {
          ...project,
          imageCount: 0,
          published:  true,
          createdAt:  serverTimestamp(),
          updatedAt:  serverTimestamp(),
        });
      }
      await batch.commit();
      seeded = toSeed.length;
      status = 'done';
    } catch (e) {
      errorMsg = String(e);
      status = 'error';
    }
  }

  const catColor = { dev: '#dbeafe', digital: '#fce7f3', pfe: '#d1fae5' };
  const catText  = { dev: '#1e40af', digital: '#9d174d', pfe: '#065f46' };
</script>

<svelte:head>
  <title>Seed Projects — Shift Admin</title>
</svelte:head>

<div class="seed-page">

  <nav class="breadcrumb">
    <a href="/shift-admin/projects">Projects</a>
    <span>/</span>
    <span>Bulk Seed</span>
  </nav>

  <div class="page-header">
    <div>
      <h1 class="page-title">Bulk Seed Projects</h1>
      <p class="page-desc">One-time import of all {ALL_PROJECTS.length} projects into Firestore. Existing slugs are skipped automatically.</p>
    </div>

    {#if status === 'idle' && !confirmed}
      <button class="check-btn" onclick={prepare}>
        Check & Preview
      </button>
    {:else if status === 'idle' && confirmed}
      <button class="seed-btn" onclick={seed} disabled={!toSeed.length}>
        {toSeed.length ? `Seed ${toSeed.length} Projects` : 'Nothing to seed'}
      </button>
    {:else if status === 'checking' || status === 'seeding'}
      <span class="status-text">{status === 'checking' ? 'Checking existing…' : 'Writing to Firestore…'}</span>
    {/if}
  </div>

  <!-- Status banners -->
  {#if status === 'done'}
    <div class="banner success">
      {seeded} project{seeded !== 1 ? 's' : ''} seeded successfully.
      {#if skipped > 0} {skipped} skipped (already existed).{/if}
      <a href="/shift-admin/projects">View Projects →</a>
    </div>
  {:else if status === 'error'}
    <div class="banner error">Error: {errorMsg}</div>
  {:else if confirmed && skipped > 0}
    <div class="banner info">
      {skipped} project{skipped !== 1 ? 's' : ''} already in Firestore and will be skipped.
      {toSeed.length} will be added.
    </div>
  {:else if confirmed && toSeed.length === 0}
    <div class="banner info">All projects are already in Firestore. Nothing to do.</div>
  {/if}

  <!-- Project table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Category</th>
          <th>Stack</th>
          <th>Status</th>
          <th>GitHub</th>
          <th class="will-seed">Will seed</th>
        </tr>
      </thead>
      <tbody>
        {#each ALL_PROJECTS as p, i}
          {@const willSeed = !confirmed || toSeed.some(t => t.slug === p.slug)}
          <tr class:skip={confirmed && !willSeed}>
            <td class="num">{i + 1}</td>
            <td class="title-cell">
              <span class="p-title">{p.title}</span>
              <span class="p-slug">{p.slug}</span>
            </td>
            <td>
              <span
                class="cat-badge"
                style="background:{catColor[p.category]};color:{catText[p.category]}"
              >{p.category}</span>
            </td>
            <td class="stack-cell">{p.stack.slice(0, 3).join(', ')}{p.stack.length > 3 ? '…' : ''}</td>
            <td class="status-cell">{p.status}</td>
            <td class="link-cell">
              {#if p.links.github}
                <a href={p.links.github} target="_blank" rel="noopener">GitHub</a>
              {:else}
                <span class="muted">—</span>
              {/if}
            </td>
            <td class="will-seed">
              {#if !confirmed}
                <span class="muted">—</span>
              {:else if willSeed}
                <span class="yes">Yes</span>
              {:else}
                <span class="no">Skip</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

</div>

<style>
  .seed-page { display: flex; flex-direction: column; gap: 1.75rem; }

  /* Breadcrumb */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .breadcrumb a { color: var(--text-muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--accent); }

  /* Header */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
  }

  .page-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin: 0 0 0.35rem;
  }

  .page-desc {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
    margin: 0;
  }

  /* Buttons */
  .check-btn {
    background: transparent;
    border: 1px solid var(--text-muted);
    color: var(--text);
    padding: 0.6rem 1.5rem;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s ease;
    flex-shrink: 0;
  }
  .check-btn:hover { border-color: var(--text); }

  .seed-btn {
    background: var(--accent);
    border: none;
    color: #fff;
    padding: 0.6rem 1.5rem;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
  }
  .seed-btn:hover:not(:disabled) { opacity: 0.88; }
  .seed-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .status-text {
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--text-muted);
    flex-shrink: 0;
    padding-top: 0.7rem;
  }

  /* Banners */
  .banner {
    font-family: var(--font-body);
    font-size: 0.85rem;
    padding: 0.875rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .banner a { color: inherit; font-weight: 600; }
  .banner.success { background: #d1fae5; color: #065f46; }
  .banner.error   { background: #fee2e2; color: #991b1b; }
  .banner.info    { background: var(--bg-card); color: var(--text-muted); }

  /* Table */
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--bg-card);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
    font-size: 0.8rem;
  }

  thead { border-bottom: 1px solid var(--bg-card); }

  th {
    text-align: left;
    padding: 0.625rem 0.875rem;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    white-space: nowrap;
  }

  td {
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--bg-card);
    vertical-align: top;
  }

  tr:last-child td { border-bottom: none; }

  tr.skip { opacity: 0.35; }

  .num {
    color: var(--text-muted);
    font-size: 0.72rem;
    width: 28px;
  }

  .title-cell {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 220px;
  }

  .p-title {
    font-weight: 600;
    color: var(--text);
  }

  .p-slug {
    font-size: 0.68rem;
    color: var(--text-muted);
    font-family: 'Courier New', monospace;
  }

  .cat-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .stack-cell {
    color: var(--text-muted);
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-cell { color: var(--text-muted); white-space: nowrap; }

  .link-cell a {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.75rem;
  }
  .link-cell a:hover { text-decoration: underline; }

  .will-seed { text-align: center; }

  .yes  { color: #059669; font-weight: 700; font-size: 0.72rem; }
  .no   { color: var(--text-muted); font-size: 0.72rem; }
  .muted { color: var(--text-muted); }
</style>
