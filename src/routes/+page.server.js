const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/shift-portfolio/databases/(default)/documents';
const API_KEY   = 'AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk';

async function loadProjects() {
  try {
    const res = await fetch(`${FIRESTORE}/projects?key=${API_KEY}&pageSize=100`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents ?? []).map((d, i) => {
      const f = d.fields ?? {};
      return {
        title:       f.title?.stringValue       ?? '',
        slug:        f.slug?.stringValue         ?? '',
        description: f.description?.stringValue  ?? '',
        category:    f.category?.stringValue     ?? '',
        status:      f.status?.stringValue       ?? '',
        thumbUrl:    f.thumbUrl?.stringValue     ?? '',
        position:    i + 1
      };
    }).filter((p) => p.title);
  } catch {
    return [];
  }
}

// Loads the FAQ section server-side so questions/answers land in the initial
// HTML and can power FAQPage structured data (client fetch never reaches Google's index reliably).
async function loadFaq() {
  try {
    const res = await fetch(`${FIRESTORE}/sections?key=${API_KEY}&pageSize=50`);
    if (!res.ok) return [];
    const data = await res.json();
    const faqDoc = (data.documents ?? []).find((d) => d.fields?.name?.stringValue === 'faq');
    const values = faqDoc?.fields?.items?.arrayValue?.values ?? [];
    return values
      .map((v) => ({
        q: v.mapValue?.fields?.q?.stringValue ?? '',
        a: v.mapValue?.fields?.a?.stringValue ?? ''
      }))
      .filter((item) => item.q && item.a);
  } catch {
    return [];
  }
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ setHeaders }) {
  // Belt-and-suspenders for crawlers: mirror the <meta name="robots"> directive as an HTTP header.
  setHeaders({ 'X-Robots-Tag': 'index, follow' });

  const [projects, faq] = await Promise.all([loadProjects(), loadFaq()]);
  return { projects, faq };
}
