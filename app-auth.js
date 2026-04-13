import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const msg = document.getElementById('msg');

const setMsg = (text, isError = false) => {
  msg.textContent = text;
  msg.style.color = isError ? '#ff8888' : '#8ff0b1';
};

const getCreds = () => ({
  email: emailInput.value.trim(),
  password: passwordInput.value
});

signupBtn.addEventListener('click', async () => {
  const { email, password } = getCreds();
  if (!email || password.length < 6) {
    setMsg('Enter a valid email + password (6+ chars).', true);
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setMsg('Account created. Redirecting...');
    window.location.href = './dashboard.html';
  } catch (error) {
    setMsg(error.message, true);
  }
});

loginBtn.addEventListener('click', async () => {
  const { email, password } = getCreds();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMsg('Logged in. Redirecting...');
    window.location.href = './dashboard.html';
  } catch (error) {
    setMsg(error.message, true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  setMsg('Logged out.');
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    setMsg(`Logged in as ${user.email}`);
  }
});
