import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import { getAnalytics, isSupported as analyticsSupported } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAmZhC-O9USnjUGR_jT84IMwSW6dRfvHP0',
  authDomain: 'wolf-lol.firebaseapp.com',
  projectId: 'wolf-lol',
  storageBucket: 'wolf-lol.firebasestorage.app',
  messagingSenderId: '579607426183',
  appId: '1:579607426183:web:80f7cf361b39615520b422',
  measurementId: 'G-GQP4RKFN5Y'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

analyticsSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
