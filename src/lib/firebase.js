import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { browser } from '$app/environment';

const firebaseConfig = {
  apiKey: 'AIzaSyArPSPE-hZdJjjfBd5KIBv7oE11db9MCIk',
  authDomain: 'shift-portfolio.firebaseapp.com',
  projectId: 'shift-portfolio',
  storageBucket: 'shift-portfolio.firebasestorage.app',
  messagingSenderId: '187108220290',
  appId: '1:187108220290:web:fd3556e756b0cc855e839b',
  measurementId: 'G-PD7PHDFDTT'
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
// Analytics only runs in the browser (not during SSR)
export const analytics = browser ? getAnalytics(app) : null;
