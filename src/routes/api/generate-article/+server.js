import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Cleans up markdown returned by the LLM for prettier display
function cleanMarkdown(md) {
  if (!md) return '';
  let cleaned = md.trim();

  // 1. Remove outer stray markdown code fences wrapping the entire output (e.g. ```markdown ... ```)
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '');
  cleaned = cleaned.replace(/\n```$/, '');

  // 2. Normalize line endings (replace carriage returns)
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // 3. Ensure headings have exactly one space after '#' markers (e.g., '###Heading' -> '### Heading')
  cleaned = cleaned.replace(/^(#+)(?!\s)(.*)$/gm, '$1 $2');

  // 4. Normalize lists: replace asterisks (*) or plusses (+) with clean hyphens (-), and ensure a single space follows
  cleaned = cleaned.replace(/^\s*[\*\+]\s+/gm, '- ');

  // 5. Ensure spaces after list markers for numbers too (e.g., '1.Item' -> '1. Item')
  cleaned = cleaned.replace(/^\s*(\d+)\.(?!\s)/gm, '$1. ');

  // 6. Clean up blockquotes: ensure they start with a space after '>' and have correct spacing
  cleaned = cleaned.replace(/^\s*>\s*/gm, '> ');

  // 7. Collapse multiple empty lines: limit spacing to exactly one blank line maximum (two consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 8. Remove any residual literal '\n' text strings that might have escaped JSON parsing
  cleaned = cleaned.replace(/\\n/g, '\n');

  // 9. Remove zero-width spaces or other common weird escaping artifacts
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 10. Clear bold double asterisks (**) from around formula highlights if the LLM adds them
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');

  // 11. Normalize em-dashes: replace '--' or plain raw hyphens wrapping comments with elegant typographical em-dashes with spaces
  cleaned = cleaned.replace(/\s*--\s*/g, ' — ');

  // 12. De-AI formula phrasing: remove overly repetitive start tokens if they escape blockquotes
  cleaned = cleaned.replace(/Accomplished /gi, '');

  return cleaned.trim();
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { title, category, tags, stack, kpis, context } = await request.json();

    if (!title?.trim()) {
      return new Response(JSON.stringify({ error: 'Title is required to generate article' }), {
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

    const systemPrompt = `You are an elite, highly polished human technical copywriter and developer.
You write incredibly clean, compelling, and premium portfolio case studies.
Your writing style is professional, direct, elegant, and punchy. Avoid typical AI introductory jargon, generic filler sentences, or repetitive transitional phrasing.

Format the project detail achievements using a natural integration of the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]."
Crucially, do NOT make the text sound formulaic or repeat the word "Accomplished" at the start of every sentence. Make them read like sophisticated, high-impact industry highlights.
Format these 2 or 3 high-impact achievements as elegant blockquotes using standard markdown blockquote formatting (> at the start of the line). Do NOT wrap the achievements in double-asterisks (**) bolding.

You MUST return ONLY a valid JSON object containing exactly these keys:
{
  "description": "A refined, 2-sentence high-impact overview of the project and its core metric achievement.",
  "article": "A beautifully written, 3-4 paragraph markdown case study split into: The Challenge (context & friction), The Solution (architecture & technical implementation), and The Impact (incorporating the elegant blockquoted metrics and final reflections).",
  "kpis": [{"label": "Name of metric (e.g., Performance, Conversion, Storage, Users)", "value": "A premium quantifiable result value (e.g., +40%, 12.8x faster, 0-install, 500k+)"}]
}
No markdown formatting or backticks around the outer JSON. Return only the raw parseable JSON object.`;

    const userPrompt = `Project Info:
Title: ${title}
Category: ${category || 'dev'}
Tags: ${tags || ''}
Stack: ${stack || ''}
KPIs/Metrics: ${JSON.stringify(kpis || [])}
Brief context/notes from developer: ${context || ''}

Generate the JSON now:`;

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
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[generate-article] API error response:', errText);
      return new Response(JSON.stringify({ error: `AI service returned error: ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content ?? '';

    // Strip code-fence wrappers the LLM sometimes adds
    reply = reply.trim();
    if (reply.startsWith('```json')) {
      reply = reply.slice(7);
    }
    if (reply.startsWith('```')) {
      reply = reply.slice(3);
    }
    if (reply.endsWith('```')) {
      reply = reply.slice(0, -3);
    }
    reply = reply.trim();

    try {
      const parsed = JSON.parse(reply);

      // Clean the markdown fields for prettier display
      if (typeof parsed === 'object' && parsed !== null) {
        if (typeof parsed.description === 'string') {
          parsed.description = cleanMarkdown(parsed.description);
        }
        if (typeof parsed.article === 'string') {
          parsed.article = cleanMarkdown(parsed.article);
        }
      }

      return json(parsed);
    } catch (parseErr) {
      console.error('[generate-article] JSON parse error on reply:', reply);
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON layout. Try generating again.', raw: reply }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    console.error('[generate-article] server exception:', err);
    return new Response(JSON.stringify({ error: err.message || 'Server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
