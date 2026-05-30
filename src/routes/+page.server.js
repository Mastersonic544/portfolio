/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    const res = await fetch(
      'https://firestore.googleapis.com/v1/projects/shift-portfolio/databases/(default)/documents/projects?key=AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk&pageSize=100'
    );
    if (!res.ok) return { projects: [] };

    const data = await res.json();
    const projects = (data.documents ?? []).map((d, i) => {
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
    }).filter(p => p.title);

    return { projects };
  } catch {
    return { projects: [] };
  }
}
