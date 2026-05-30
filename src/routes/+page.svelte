<script>
  import Hero from '$lib/components/public/Hero.svelte';
  import About from '$lib/components/public/About.svelte';
  import Services from '$lib/components/public/Services.svelte';
  import Projects from '$lib/components/public/Projects.svelte';
  import Highlights from '$lib/components/public/Highlights.svelte';
  import Teaching from '$lib/components/public/Teaching.svelte';
  import CTA from '$lib/components/public/CTA.svelte';
  import MiniCTA from '$lib/components/public/MiniCTA.svelte';
  import AvailabilityBanner from '$lib/components/public/AvailabilityBanner.svelte';
  import Contact from '$lib/components/public/Contact.svelte';
  import FAQ from '$lib/components/public/FAQ.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import Chatbot from '$lib/components/public/Chatbot.svelte';

  /** @type {{ data: { projects: { title: string; slug: string; description: string; category: string; status: string; thumbUrl: string; position: number }[] } }} */
  let { data } = $props();

  const SITE_URL = 'https://yassinedhouib.dev';

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Yassine Dhouib',
    alternateName: 'Shift',
    url: SITE_URL,
    image: `${SITE_URL}/images/og.webp`,
    jobTitle: 'Full Stack Developer & Creative Technologist',
    description: 'Freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia.',
    address: { '@type': 'PostalAddress', addressLocality: 'Sfax', addressCountry: 'TN' },
    email: 'yassine.m.dhouib@gmail.com',
    telephone: '+21654489995',
    sameAs: [
      'https://www.linkedin.com/in/yassine-dhouib-798092266/',
      'https://github.com/Mastersonic544'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Yassine Dhouib — Shift',
    url: SITE_URL,
    description: 'Portfolio of Yassine Dhouib (Shift), full stack developer and creative technologist based in Sfax, Tunisia.',
    author: { '@type': 'Person', name: 'Yassine Dhouib' }
  };

  const projectsSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Yassine Dhouib's Projects",
    url: `${SITE_URL}/#projects`,
    itemListElement: data.projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        description: p.description || undefined,
        url: `${SITE_URL}/#projects`,
        author: { '@type': 'Person', name: 'Yassine Dhouib' }
      }
    }))
  });
</script>

<svelte:head>
  <title>Shift — Yassine Dhouib | Developer, Designer, Teacher</title>
  <meta name="description"  content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta name="keywords"     content="Yassine Dhouib, Shift developer, freelance developer Tunisia, full stack developer Sfax, SvelteKit, React, Flutter, Firebase, graphic design, video editing, PFE help Tunisia, coding mentor" />
  <meta name="author"       content="Yassine Dhouib" />
  <meta name="robots"       content="index, follow" />

  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="{SITE_URL}/" />
  <meta property="og:title"       content="Shift — Yassine Dhouib | Developer, Designer, Teacher" />
  <meta property="og:description" content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta property="og:image"       content="{SITE_URL}/images/og.webp" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="Yassine Dhouib — Shift portfolio" />
  <meta property="og:locale"      content="en_US" />
  <meta property="og:site_name"   content="Shift — Yassine Dhouib" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="Shift — Yassine Dhouib | Developer, Designer, Teacher" />
  <meta name="twitter:description" content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta name="twitter:image"       content="{SITE_URL}/images/og.webp" />
  <meta name="twitter:image:alt"   content="Yassine Dhouib — Shift portfolio" />

  <link rel="canonical" href="{SITE_URL}/" />

  <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
  <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
  {#if data.projects.length > 0}
    <script type="application/ld+json">{JSON.stringify(projectsSchema)}</script>
  {/if}
</svelte:head>

<Hero />
<About /><MiniCTA />
<Services /><MiniCTA />
<Projects /><MiniCTA />
<Highlights /><MiniCTA />
<Teaching /><MiniCTA />
<CTA />
<AvailabilityBanner />
<Contact />
<FAQ /><MiniCTA />
<Footer />
<Chatbot />
