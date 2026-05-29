import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk',
  authDomain: 'shift-portfolio.firebaseapp.com',
  projectId: 'shift-portfolio',
  storageBucket: 'shift-portfolio.firebasestorage.app',
  messagingSenderId: '187108220290',
  appId: '1:187108220290:web:fd3556e756b0cc855e839b',
};

const app = initializeApp(firebaseConfig);
const db  = initializeFirestore(app, { localCache: memoryLocalCache() });

const SECTIONS = [
  {
    name: 'hero',
    order: 0,
    visible: true,
    content: {
      biography:        'Freelance full stack developer, vibe coder, and AI-native builder based in Sfax, Tunisia. I ship powerful digital products, automation tools, and branding assets fast. In seconds, not days.',
      contact_location: 'Sfax, Tunisia',
      contact_email:    'yassine.m.dhouib@gmail.com',
      contact_phone:    '+216 54 489 995',
    },
    kpis: [
      { num: 5,   suffix: '+', label: 'Years of Experience' },
      { num: 100, suffix: '%', label: 'Client Satisfaction' },
      { num: 7,   suffix: '+', label: 'Companies Worked With' },
      { num: 48,  suffix: '+', label: 'Projects Shipped' },
    ],
    services: ['Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design', 'Video Editing'],
    companies: [
      { name: 'Dalmar', url: '/images/companies/dalmar.webp' },
      { name: 'ENET',   url: '/images/companies/enet.webp' },
      { name: 'RS',     url: '/images/companies/rs.webp' },
    ],
  },
  {
    name: 'availability',
    order: 1,
    visible: true,
    content: {
      text: 'Yassine Dhouib · freelance developer available for hire · Sfax, Tunisia · Remote worldwide',
    },
  },
  {
    name: 'about',
    order: 2,
    visible: true,
    content: {
      bio: "I'm Yassine Dhouib, a multi-disciplinary developer and creative technologist based in Sfax, Tunisia. I build full-stack web applications, mobile apps, IoT systems, and automation tools. I'm also a freelance graphic designer, video editor, and coding mentor. Currently building CHIFT, a B2B mobile platform. I ship fast, build with AI, and thrive where disciplines overlap.",
    },
    education: [
      { institution: 'International School of Business', degree: 'Bachelor of Business Intelligence', year: '2024 – 2027' },
      { institution: 'Medipol University Istanbul',      degree: 'Engineering, Electrical & Electronics', year: '2022' },
    ],
    skills: ['React', 'Flutter', 'Node.js', 'Python', 'TypeScript', 'Firebase', 'Supabase', 'Arduino', 'ESP32', 'Figma', 'Adobe Premiere', 'After Effects', 'Blender', 'Git', 'Tailwind', 'PHP', 'SQL'],
    quickScan: [
      { key: 'Location',     value: 'Sfax, Tunisia · Remote worldwide' },
      { key: 'Availability', value: 'Open to freelance & remote work' },
      { key: 'Languages',    value: 'Arabic · French · English' },
    ],
  },
  {
    name: 'services',
    order: 3,
    visible: true,
    cards: [
      { title: 'Digital',              desc: 'Graphic design, logo design, freelance video editing, and visual storytelling for businesses and creators in Tunisia and worldwide.', services: ['Graphic Design Tunisia', 'Logo Design', 'Video Editing'], category: 'digital' },
      { title: 'Dev',                  desc: 'Full stack web development, mobile apps, IoT systems, Arduino projects, and automation tools built fast with AI-assisted development.', services: ['Web App Development', 'IoT & Arduino', 'Automation Tools'], category: 'dev' },
      { title: 'Academic Consulting',  desc: 'PFE help Tunisia, thesis support, project reports, and academic guidance for engineering students across Tunisia.', services: ['PFE Projects Tunisia', 'Thesis Support', 'Academic Reports'], category: 'pfe' },
    ],
  },
  {
    name: 'teaching',
    order: 4,
    visible: true,
    content: {
      heading:     'Coding mentor. Programming teacher. Available in Sfax and online.',
      description: "Whether it's web development, UI/UX design, IoT, or PFE project support. I teach any skill to anyone who genuinely wants to learn. One-on-one sessions, workshops, or long-form mentoring. In person in Sfax, Tunisia or fully remote.",
    },
  },
  {
    name: 'highlights',
    order: 5,
    visible: true,
    items: [
      { slug: 'hackathon-win', date: 'Dec 2024', caption: 'Hackathon winner, Shifters 2024' },
      { slug: 'campus-talk',  date: 'Oct 2024', caption: 'Teaching programming, Sfax' },
      { slug: 'iot-lab',      date: 'Sep 2024', caption: 'IoT & Arduino project, late nights' },
      { slug: 'sfax-design',  date: 'Aug 2024', caption: 'Design sprint, Sfax, Tunisia' },
    ],
  },
  {
    name: 'faq',
    order: 6,
    visible: true,
    items: [
      { q: 'Are you available for freelance work?',    a: "Yes, I'm a freelance developer based in Sfax, Tunisia, open to remote projects worldwide. Whether you need a frontend developer for a short sprint, a full stack developer for a longer engagement, or a vibe coder who can ship fast using AI-assisted development, reach out and we'll make it work." },
      { q: 'Do you help with PFE projects?',           a: "Yes. I've guided 20+ students in Tunisia through their final-year engineering projects (PFE). I offer technical support: web apps, IoT projects, mobile apps, as well as academic writing and structuring. If you need PFE help in Tunisia or aide PFE Tunisie, I'm available." },
      { q: 'What technologies do you work with?',      a: "Primarily SvelteKit, React, Firebase, and Python on the software side, plus ESP32 and Arduino for IoT projects. For design: Figma, After Effects, and Premiere Pro. I also rely heavily on AI workflow automation: OpenRouter, Claude Code, and prompt engineering are part of my everyday stack as an AI-native developer." },
      { q: 'What is vibe coding?',                     a: "Vibe coding is an AI-first development approach, using tools like Claude Code, Cursor, and OpenRouter to ship features at speed. As an AI-native developer and vibe coder, I use LLM-powered development and AI workflow automation to build in hours what used to take weeks. It's how I stay lean and fast as a solo builder." },
      { q: 'Can you build my app?',                    a: "Yes. Whether you need a web app, mobile app, SaaS tool, or automation system, I can design and build it end-to-end. From UI/UX design to deployment on Firebase or Vercel, I handle the full lifecycle as a freelance full stack developer available for hire." },
      { q: 'Can you work with international clients?', a: "Absolutely. As a remote web developer from Tunisia, I'm async-friendly and comfortable across time zones. Most of my communication is in English or French. I've worked with clients across North Africa and beyond as a freelance web developer in the North Africa region." },
      { q: 'Where are you based?',                     a: "I'm based in Sfax, Tunisia. If you're looking to hire a developer in Sfax, or need a remote freelance developer from Tunisia, I'm available. I'm also open to occasional on-site work within Tunisia." },
      { q: 'Do you teach programming?',                a: "Yes, as a coding mentor and programming teacher in Sfax, I've worked with 100+ students across code, design, IoT, and academic writing. I offer one-on-one sessions, small group workshops, and long-form mentoring, in person in Sfax or online as a student mentor Tunisia." },
    ],
  },
  {
    name: 'contact',
    order: 7,
    visible: true,
    content: {
      subtitle: "Freelance developer and designer available for remote work. Based in Sfax, Tunisia. Whether you need a web developer, graphic designer, video editor, coding mentor, or PFE help. Let's talk.",
    },
    socials: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yassine-dhouib-798092266/' },
      { label: 'GitHub',   href: 'https://github.com/Mastersonic544' },
    ],
  },
];

async function seed() {
  console.log('Checking existing sections…');
  const existingNames = new Set();
  for (const s of SECTIONS) {
    const snap = await getDocs(query(collection(db, 'sections'), where('name', '==', s.name)));
    if (!snap.empty) existingNames.add(s.name);
  }

  const toSeed = SECTIONS.filter(s => !existingNames.has(s.name));
  console.log(`${existingNames.size} already exist, seeding ${toSeed.length} new sections…`);

  if (!toSeed.length) {
    console.log('Nothing to seed.');
    process.exit(0);
  }

  const batch = writeBatch(db);
  for (const section of toSeed) {
    batch.set(doc(collection(db, 'sections')), section);
  }
  await batch.commit();
  console.log(`Done! Sections seeded: ${toSeed.map(s => s.name).join(', ')}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Failed:', err.message ?? err);
  process.exit(1);
});
