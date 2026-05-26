import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<string>} */
export const activeSection = writable('');

/** @type {import('svelte/store').Writable<string[]>} */
export const sections = writable([]);
