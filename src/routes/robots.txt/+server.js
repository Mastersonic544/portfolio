/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const origin = url.origin;
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /shift-admin/',
    '',
    `Sitemap: ${origin}/sitemap.xml`
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
