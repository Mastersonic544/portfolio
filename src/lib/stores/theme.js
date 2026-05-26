import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const stored = browser ? localStorage.getItem('theme') : null;

/** @type {import('svelte/store').Writable<'light' | 'dark'>} */
export const theme = writable(/** @type {'light' | 'dark'} */ (stored || 'light'));

if (browser) {
  theme.subscribe((value) => {
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
  });
}
