/**
 * Returns the thumbnail path for a project.
 * @param {string} id - Project identifier
 * @returns {string}
 */
export function thumb(id) {
  return `/images/projects/${id}-thumb.webp`;
}

/**
 * Returns an array of gallery image paths for a project.
 * @param {string} id - Project identifier
 * @param {number} n - Number of gallery images
 * @returns {string[]}
 */
export function gallery(id, n) {
  return Array.from({ length: n }, (_, i) => `/images/projects/${id}-${i + 1}.webp`);
}
