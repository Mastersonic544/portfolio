# Bug Log

## BUG-001 — Cannot edit thumbnail or upload local WebP image in Admin panel
Symptom: Admin cannot save thumbnails locally to static/images/projects/; image files were only local preview URLs on edit/add page and didn't persist to the local folder.
File/line: c:/Users/djla7/Downloads/shift-portfolio/src/routes/shift-admin/projects/edit/[id]/+page.svelte and c:/Users/djla7/Downloads/shift-portfolio/src/routes/shift-admin/projects/add/+page.svelte
Root cause: Lack of a server upload API endpoint to save files to local storage, and missing fetch integration on the file input component.
Attempts:
- [2026-05-27] Attempt 1: Created `/api/upload-image` endpoint to write the uploaded webp Blob to `static/images/projects/`, and modified edit/add project views to execute the upload fetch. -> SUCCESS
Resolution: SvelteKit server route POST handles writing arrayBuffer to disk using fs/promises.
Status: RESOLVED

## BUG-002 — Broken hero image in Project Modal Expansion
Symptom: Thumbnail image is broken when clicking the project article card to open the detail modal.
File/line: c:/Users/djla7/Downloads/shift-portfolio/src/lib/components/public/ProjectExpand.svelte:69
Root cause: The modal hardcoded `/images/projects/{id}-1.webp` instead of using the uploaded `-thumb.webp` image URL.
Attempts:
- [2026-05-27] Attempt 1: Imported `thumb` helper from `$lib/utils/images.js` and replaced the hardcoded `-1.webp` URL with `thumb(project.slug ?? project.id)`. -> SUCCESS
Resolution: Use the imported `thumb` utility to dynamically resolve project thumbnail image URLs.
Status: RESOLVED
