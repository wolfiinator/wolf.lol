import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';

const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const status = document.getElementById('status');

const setStatus = (text, err = false) => {
  status.textContent = text;
  status.style.color = err ? '#ff9090' : '#92f1a2';
};

loginBtn.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
    window.location.href = '../customize/';
  } catch (e) {
    setStatus(e.message, true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  setStatus('Logged out.');
});

onAuthStateChanged(auth, (user) => {
  if (user) setStatus(`Logged in as ${user.email}`);
});
