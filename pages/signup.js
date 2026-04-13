import { auth } from '../firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';
import { claimSubdomain } from './utils.js';

const email = document.getElementById('email');
const password = document.getElementById('password');
const subdomain = document.getElementById('subdomain');
const signupBtn = document.getElementById('signup');
const status = document.getElementById('status');

const setStatus = (text, err = false) => {
  status.textContent = text;
  status.style.color = err ? '#ff9090' : '#92f1a2';
};

signupBtn.addEventListener('click', async () => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
    const claim = await claimSubdomain(cred.user.uid, subdomain.value);
    setStatus(`Account created and claimed /${claim}. Redirecting...`);
    setTimeout(() => {
      window.location.href = '../customize/';
    }, 700);
  } catch (e) {
    setStatus(e.message, true);
  }
});
