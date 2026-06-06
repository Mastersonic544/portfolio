import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Takes an array of project objects in the export schema (with some fields set
 * to null) and asks OpenRouter to fill in only the null/blank fields with
 * realistic, sensible data — leaving existing values untouched.
 */

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { projects } = await request.json();

    if (!Array.isArray(projects) || projects.length === 0) {
      return new Response(JSON.stringify({ error: 'No projects provided to enrich.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      return new Response(JSON.stringify({ error: 'OpenRouter API Key is missing or invalid in environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are a meticulous data assistant for a software developer's portfolio.
You receive a JSON array of project objects. Some fields are null or empty.
Your job: fill in ONLY the null/empty fields with realistic, plausible values that are consistent with the project's existing name, description, and tech_stack.
Rules:
- NEVER change a field that already has a non-null value. Keep it exactly as given.
- "type" should be a short category like "Web App", "Mobile App", "Desktop App", "Automation", "Academic", etc.
- "technologies" should be a concise comma-separated string of the main technologies (derive from tech_stack/description if needed).
- "role" should be a realistic role like "Full-Stack Developer", "Frontend Developer", "Designer & Developer", etc.
- "status" should be one of "Live", "In Progress", or "Case Study" if blank.
- "outcome" should be a short, realistic one-sentence result/impact statement.
- "url" may stay null if no realistic URL can be inferred (do not invent fake domains).
- Keep "id" as null unless it already has a value.
- Keep tech_stack as an array.

You MUST return ONLY a valid JSON object of the exact shape: {"projects": [ ...same objects, blanks filled... ]}
Return the same number of objects in the same order. No markdown, no backticks, no commentary.`;

    const userPrompt = `Here are the projects. Fill the blanks and return the JSON object now:
${JSON.stringify({ projects }, null, 2)}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shift-portfolio.vercel.app',
        'X-Title': 'Shift Portfolio'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 3000
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[enrich-projects] API error response:', errText);
      return new Response(JSON.stringify({ error: `AI service returned error: ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();
    let reply = (data.choices?.[0]?.message?.content ?? '').trim();

    // Strip code-fence wrappers the LLM sometimes adds
    if (reply.startsWith('```json')) reply = reply.slice(7);
    if (reply.startsWith('```'))     reply = reply.slice(3);
    if (reply.endsWith('```'))       reply = reply.slice(0, -3);
    reply = reply.trim();

    try {
      const parsed = JSON.parse(reply);
      const out = Array.isArray(parsed) ? parsed : parsed.projects;
      if (!Array.isArray(out)) throw new Error('Missing projects array');
      return json({ projects: out });
    } catch (parseErr) {
      console.error('[enrich-projects] JSON parse error on reply:', reply);
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON. Try again.', raw: reply }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    console.error('[enrich-projects] server exception:', err);
    return new Response(JSON.stringify({ error: err.message || 'Server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
