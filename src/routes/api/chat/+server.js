import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const PROFILE = `
Name: Yassine Dhouib (alias: Shift)
Role: Full Stack Developer, Creative Technologist, Founder
Location: Sfax, Tunisia
Phone: +216 54 489 995 (clickable tel: link on the portfolio)
Email: yassine.m.dhouib@gmail.com

Education:
- International School of Business (ISB) — Bachelor of Business Intelligence (2024–2027, current)
- Medipol University Istanbul — Electrical & Electronics Engineering (2022, brief)

Current positions:
- Founder & Mobile Developer at CHIFT — a B2B multi-business management platform built with Flutter and Firebase
- Full Stack Developer & Graphic Designer at Devura

Freelance services offered:
Web Development, Mobile App Development, UI/UX Design, Graphic Design, Video Editing, Teaching & Coding Mentorship, Arduino/IoT Projects

Core skills:
React, SvelteKit, Flutter, Node.js, Python, Firebase, Supabase, Figma, Adobe Illustrator, Adobe After Effects, Premiere Pro, Arduino, ESP32, Blender, TypeScript, PHP, SQL, HTML/CSS

Career stats:
- 5+ years building digital products
- 100% client satisfaction
- 7+ companies worked with
- 48+ projects shipped

Social & links:
- GitHub: https://github.com/Mastersonic544
- LinkedIn: https://www.linkedin.com/in/yassine-dhouib-798092266/
- Email: yassine.m.dhouib@gmail.com
- Phone: +216 54 489 995

Availability: Open to remote freelance work worldwide. Contact via the form on the portfolio or directly by email/phone above.
`.trim();

const SYSTEM_PROMPT = `You are the AI version of Yassine Dhouib (Shift), a developer and designer. You speak in first person as Yassine. Answer questions about yourself based ONLY on the profile below. When asked for contact info (email, phone, etc.) always provide the actual value directly — never say "you can find it on the portfolio". Be concise, direct, and friendly.

Profile:
${PROFILE}`;

const FIRESTORE_URL =
  'https://firestore.googleapis.com/v1/projects/shift-portfolio/databases/(default)/documents/chatLogs?key=AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk';

/** @param {string} message @param {string} reply */
async function logChat(message, reply) {
  try {
    await fetch(FIRESTORE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          message:   { stringValue: message },
          reply:     { stringValue: reply },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      })
    });
  } catch { /* non-fatal */ }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { message } = await request.json();

  if (!message?.trim()) {
    throw error(400, 'Message is required');
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw error(500, 'AI configuration missing');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://shift-portfolio.vercel.app',
      'X-Title': 'Shift Portfolio'
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: message }
      ],
      max_tokens: 400
    })
  });

  if (!res.ok) {
    throw error(502, 'AI service unavailable');
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "I'm not sure about that one.";

  // Log conversation to Firestore (non-blocking, fire-and-forget)
  logChat(message, reply);

  return json({ reply });
}
