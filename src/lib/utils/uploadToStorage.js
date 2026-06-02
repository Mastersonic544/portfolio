/**
 * Uploads a WebP Blob to Cloudinary via an unsigned upload preset.
 * Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET in .env / Vercel env vars.
 * @param {Blob} blob
 * @param {'highlights'|'projects'|'companies'} folder
 * @param {string} filename - e.g. 'my-slug.webp'
 * @returns {Promise<string>} permanent CDN URL
 */
export async function uploadToStorage(blob, folder, filename) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset    = import.meta.env.VITE_CLOUDINARY_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      'Cloudinary is not configured: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_PRESET are missing. ' +
      'Set them in .env (local) and in the Vercel project env vars (production), then restart the dev server.'
    );
  }

  const publicId = `shift/${folder}/${filename.replace(/\.webp$/, '')}`;

  const form = new FormData();
  form.append('file', blob, filename);
  form.append('upload_preset', preset);
  form.append('public_id', publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    // Cloudinary returns the real reason in the body (e.g. "Upload preset not found").
    let reason = '';
    try {
      const errBody = await res.json();
      reason = errBody?.error?.message || '';
    } catch { /* body not JSON */ }
    throw new Error(`Cloudinary upload failed (${res.status})${reason ? `: ${reason}` : ''}`);
  }

  const data = await res.json();
  return /** @type {string} */ (data.secure_url);
}
