import { writable } from 'svelte/store';

/**
 * @typedef {Object} ProjectLinks
 * @property {string} [github]
 * @property {string} [demo]
 * @property {string} [loom]
 * @property {string} [preview]
 * @property {string} [previewLabel]
 * @property {string} [behance]       External showcase URL for digital work (Behance, Dribbble, video…)
 * @property {string} [behanceLabel]  Custom button label for the showcase link (defaults to "Behance")
 * @property {string} [document]      Document URL for academic work (presentation, PDF, Google Docs…)
 * @property {string} [documentLabel] Custom button label for the document link (defaults to "View PDF")
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {'digital'|'dev'|'pfe'} category
 * @property {string[]} tags
 * @property {string} [thumbUrl]
 * @property {string} [url]
 * @property {number} [galleryCount]
 * @property {string} [article]
 * @property {string[]} [stack]
 * @property {{ label: string, value: string }[]} [kpis]
 * @property {'Live'|'In Progress'|'Case Study'} [status]
 * @property {ProjectLinks} [links]
 * @property {string} [showcaseNote]  Short paragraph shown beside the showcase link for digital / academic work
 * @property {string} [client]
 * @property {string} [year]
 * @property {boolean} [published]
 */

/** @type {import('svelte/store').Writable<Project[]>} */
export const projects = writable([]);

/** @type {import('svelte/store').Writable<string>} */
export const activeCategory = writable('');

/** @type {import('svelte/store').Writable<string>} */
export const activeTag = writable('');
