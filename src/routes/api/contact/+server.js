import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body = await request.json();
  console.log('[contact]', body);
  return json({ ok: true });
}
