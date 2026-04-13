import { auth, db, storage } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js';
import { claimSubdomain } from './utils.js';

const account = document.getElementById('account');
const username = document.getElementById('username');
const avatar = document.getElementById('avatar');
const background = document.getElementById('background');
const bio1 = document.getElementById('bio1');
const bio2 = document.getElementById('bio2');
const subdomain = document.getElementById('subdomain');
const claimBtn = document.getElementById('claim');
const saveBtn = document.getElementById('save');
const viewBtn = document.getElementById('view');
const logoutBtn = document.getElementById('logout');
const status = document.getElementById('status');

let currentUser;

const setStatus = (text, err = false) => {
  status.textContent = text;
  status.style.color = err ? '#ff9090' : '#92f1a2';
};

async function upload(input, path) {
  const file = input.files?.[0];
  if (!file) return '';
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

async function loadProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid));
  if (!snap.exists()) return;
  const data = snap.data();
  username.value = data.username || '';
  bio1.value = data.bios?.[0] || '';
  bio2.value = data.bios?.[1] || '';
  subdomain.value = data.subdomain || '';
}

claimBtn.addEventListener('click', async () => {
  try {
    const claim = await claimSubdomain(currentUser.uid, subdomain.value);
    subdomain.value = claim;
    setStatus(`Claim saved: /${claim}`);
  } catch (e) {
    setStatus(e.message, true);
  }
});

saveBtn.addEventListener('click', async () => {
  try {
    const bg = background.files?.[0];
    if (bg && bg.size > 25 * 1024 * 1024) throw new Error('Background must be <= 25MB.');

    const avatarUrl = await upload(avatar, `users/${currentUser.uid}/avatar`);
    const backgroundUrl = await upload(background, `users/${currentUser.uid}/background.mp4`);

    await setDoc(doc(db, 'profiles', currentUser.uid), {
      username: username.value.trim(),
      avatarUrl,
      backgroundUrl,
      bios: [bio1.value.trim(), bio2.value.trim()].filter(Boolean),
      badges: ['early access'],
      subdomain: subdomain.value.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    setStatus('Profile saved.');
  } catch (e) {
    setStatus(e.message, true);
  }
});

viewBtn.addEventListener('click', () => {
  const claim = subdomain.value.trim();
  if (!claim) {
    setStatus('Claim a subdomain first.', true);
    return;
  }
  window.location.href = `../${claim}`;
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = '../login/';
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../login/';
    return;
  }

  currentUser = user;
  account.textContent = `Logged in as ${user.email}`;
  await loadProfile(user.uid);
});
