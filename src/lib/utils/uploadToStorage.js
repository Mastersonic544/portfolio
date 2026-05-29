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

  const publicId = `shift/${folder}/${filename.replace(/\.webp$/, '')}`;

  const form = new FormData();
  form.append('file', blob, filename);
  form.append('upload_preset', preset);
  form.append('public_id', publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);

  const data = await res.json();
  return /** @type {string} */ (data.secure_url);
}
