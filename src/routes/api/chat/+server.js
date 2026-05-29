import { json, error } from '@sveltejs/kit';
import { OPENROUTER_API_KEY } from '$env/dynamic/private';

// TODO: Replace this placeholder with your actual profile JSON
const PROFILE_CONTEXT = `PROFILE_JSON_PLACEHOLDER`;

const SYSTEM_PROMPT = `You are Shift (Yassine Dhouib), a developer and designer from Sfax, Tunisia. Answer questions ONLY based on the provided profile context. If the answer is not in the context, say you don't have that info. Be conversational and direct.

Context: ${PROFILE_CONTEXT}`;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { message } = await request.json();

  if (!message?.trim()) {
    throw error(400, 'Message is required');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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

  return json({ reply });
}
