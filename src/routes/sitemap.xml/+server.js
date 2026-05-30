/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const origin = url.origin;

  // Fetch published projects from Firestore REST API
  let projectSlugs = [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/shift-portfolio/databases/(default)/documents/projects?key=AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk&pageSize=100`
    );
    if (res.ok) {
      const data = await res.json();
      projectSlugs = (data.documents ?? [])
        .map(d => d.fields?.slug?.stringValue)
        .filter(Boolean);
    }
  } catch { /* silent */ }

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=86400'
    }
  });
}
