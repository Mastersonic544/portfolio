import { writable } from 'svelte/store';

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
 */

/** @type {import('svelte/store').Writable<Project[]>} */
export const projects = writable([]);

/** @type {import('svelte/store').Writable<string>} */
export const activeCategory = writable('');

/** @type {import('svelte/store').Writable<string>} */
export const activeTag = writable('');
