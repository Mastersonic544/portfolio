import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a click event to the Firestore analytics collection.
 * @param {string} section - The section that was clicked
 * @returns {Promise<void>}
 */
export async function logClick(section) {
  try {
    await addDoc(collection(db, 'analytics'), {
      section,
      type: 'click',
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Analytics write failed:', err);
  }
}
