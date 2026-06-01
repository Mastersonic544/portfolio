/**
 * Project taxonomy — single source of truth shared by the admin add/edit forms
 * (checkbox pickers) and the public Projects filter (category dropdown).
 *
 * "Type" is the top-level bucket (dev / digital / pfe). "Categories" are the
 * finer sub-tags within a type, e.g. a Flutter app is type `dev`, category `Flutter`.
 * Selected categories are stored on each project's `tags` array.
 */

/** @type {Record<'dev'|'digital'|'pfe', string[]>} */
export const categoriesByType = {
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

/** Flat, de-duplicated list across every type — used when "All" is selected. */
export const allCategories = [...new Set(Object.values(categoriesByType).flat())];

/**
 * Returns the category options for a given type.
 * @param {string} type '' (all), 'dev', 'digital' or 'pfe'
 * @returns {string[]}
 */
export function categoriesFor(type) {
  return type && type in categoriesByType
    ? categoriesByType[/** @type {'dev'|'digital'|'pfe'} */ (type)]
    : allCategories;
}
