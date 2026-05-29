<script>
  import Hero from '$lib/components/public/Hero.svelte';
  import About from '$lib/components/public/About.svelte';
  import Services from '$lib/components/public/Services.svelte';
  import Projects from '$lib/components/public/Projects.svelte';
  import Highlights from '$lib/components/public/Highlights.svelte';
  import Teaching from '$lib/components/public/Teaching.svelte';
  import AvailabilityBanner from '$lib/components/public/AvailabilityBanner.svelte';
  import Contact from '$lib/components/public/Contact.svelte';
  import FAQ from '$lib/components/public/FAQ.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import Chatbot from '$lib/components/public/Chatbot.svelte';
</script>

<svelte:head>
  <title>Shift — Yassine Dhouib | Developer, Designer, Teacher</title>
  <meta name="description" content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta name="keywords" content="Yassine Dhouib, Shift developer, freelance developer Tunisia, full stack developer Sfax, SvelteKit, React, Firebase, graphic design, video editing, PFE help Tunisia" />
  <meta name="author" content="Yassine Dhouib" />

  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="https://yassinedhouib.netlify.app" />
  <meta property="og:title"       content="Shift — Yassine Dhouib | Developer, Designer, Teacher" />
  <meta property="og:description" content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta property="og:image"       content="https://yassinedhouib.netlify.app/images/og.webp" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:site"        content="@yassinedhouib" />
  <meta name="twitter:title"       content="Shift — Yassine Dhouib | Developer, Designer, Teacher" />
  <meta name="twitter:description" content="Yassine Dhouib (Shift) — freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote work worldwide." />
  <meta name="twitter:image"       content="https://yassinedhouib.netlify.app/images/og.webp" />

  <link rel="canonical" href="https://yassinedhouib.netlify.app" />

  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Yassine Dhouib",
    "alternateName": "Shift",
    "url": "https://yassinedhouib.netlify.app",
    "jobTitle": "Full Stack Developer & Creative Technologist",
    "description": "Freelance full stack developer, UI/UX designer, and coding mentor based in Sfax, Tunisia. Available for remote freelance work worldwide.",
    "address": { "@type": "PostalAddress", "addressLocality": "Sfax", "addressCountry": "TN" },
    "email": "yassine.m.dhouib@gmail.com",
    "sameAs": [
      "https://www.linkedin.com/in/yassine-dhouib-798092266/",
      "https://github.com/Mastersonic544"
    ]
  })}</script>
</svelte:head>

<Hero />
<About />
<Services />
<Projects />
<Highlights />
<Teaching />
<AvailabilityBanner />
<Contact />
<FAQ />
<Footer />
<Chatbot />
