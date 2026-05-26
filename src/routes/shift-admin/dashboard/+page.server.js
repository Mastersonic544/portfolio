import { env } from '$env/dynamic/private';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  let visits  = null;
  let uniques = null;

  if (env.VERCEL_API_TOKEN && env.VERCEL_PROJECT_ID) {
    try {
      const to   = Date.now();
      const from = to - 30 * 24 * 60 * 60 * 1000; // 30-day window
      const res  = await fetch(
        `https://vercel.com/api/v1/analytics/${env.VERCEL_PROJECT_ID}/page-views?from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${env.VERCEL_API_TOKEN}` } }
      );
      if (res.ok) {
        const data = await res.json();
        visits  = data.total  ?? null;
        uniques = data.unique ?? null;
      }
    } catch { /* graceful — shows "—" in the UI */ }
  }

  return { visits, uniques };
}
