import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.js';

/**
 * Project taxonomy — shared by the admin add/edit forms (checkbox pickers),
 * the public Projects filter (category dropdown) and the admin Categories CRUD.
 *
 * "Type" is the top-level bucket (dev / digital / pfe). "Categories" are the
 * finer sub-tags within a type, e.g. a Flutter app is type `dev`, category `Flutter`.
 * Selected categories are stored on each project's `tags` array.
 *
 * The editable list lives in Firestore at `sections/categories` (the `sections`
 * collection is already publicly readable + admin-writable); the defaults below
 * seed that document and act as a fallback when it can't be read.
 */

/** @typedef {{ dev: string[], digital: string[], pfe: string[] }} Taxonomy */

export const TYPES = /** @type {const} */ ([
  { value: 'dev',     label: 'Dev' },
  { value: 'digital', label: 'Digital' },
  { value: 'pfe',     label: 'Academic' }
]);

/** @type {Taxonomy} */
export const DEFAULT_CATEGORIES = {
  dev: [
    'Flutter', 'Mobile App', 'Web App', 'SvelteKit', 'React', 'Node.js',
    'Python', 'Firebase', 'IoT', 'Arduino', 'ESP32', 'Automation', 'AI'
  ],
  digital: [
    'Logo', 'Branding', 'Graphic Design', 'Illustration', 'Video Editing',
    'Motion', 'After Effects', '3D', 'Social Media', 'Photography'
  ],
  pfe: [
    'Thesis', 'Report', 'Research', 'Presentation', 'Machine Learning',
    'Networks', 'Business Intelligence', 'Data Analysis'
  ]
};

/** Returns a fresh, normalized taxonomy object (every type guaranteed to be an array). */
export function emptyTaxonomy() {
  return { dev: [], digital: [], pfe: [] };
}

/**
 * Loads the editable taxonomy from Firestore (meta/taxonomy), falling back to
 * DEFAULT_CATEGORIES if the doc is missing or unreadable. Client-side only.
 * @returns {Promise<Taxonomy>}
 */
export async function loadCategories() {
  try {
    const snap = await getDoc(doc(db, 'sections', 'categories'));
    if (snap.exists()) {
      const d = /** @type {any} */ (snap.data());
      return {
        dev:     Array.isArray(d.dev)     ? d.dev     : DEFAULT_CATEGORIES.dev,
        digital: Array.isArray(d.digital) ? d.digital : DEFAULT_CATEGORIES.digital,
        pfe:     Array.isArray(d.pfe)     ? d.pfe     : DEFAULT_CATEGORIES.pfe
      };
    }
  } catch (_) { /* fall through to defaults */ }
  return { dev: [...DEFAULT_CATEGORIES.dev], digital: [...DEFAULT_CATEGORIES.digital], pfe: [...DEFAULT_CATEGORIES.pfe] };
}

/**
 * Category options for a given type from a loaded taxonomy map.
 * @param {Taxonomy} map
 * @param {string} type '' (all), 'dev', 'digital' or 'pfe'
 * @returns {string[]}
 */
export function categoriesFor(map, type) {
  if (type && /** @type {any} */ (map)[type]) return /** @type {any} */ (map)[type];
  return [...new Set([...(map.dev ?? []), ...(map.digital ?? []), ...(map.pfe ?? [])])];
}
