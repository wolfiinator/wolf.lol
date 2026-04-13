import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';
import {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js';

const accountNode = document.getElementById('account');
const logoutBtn = document.getElementById('logout');
const subdomainInput = document.getElementById('subdomain');
const claimBtn = document.getElementById('claim');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');
const backgroundInput = document.getElementById('background');
const bio1Input = document.getElementById('bio1');
const bio2Input = document.getElementById('bio2');
const linksNode = document.getElementById('links');
const tracksNode = document.getElementById('tracks');
const addLinkBtn = document.getElementById('add-link');
const addTrackBtn = document.getElementById('add-track');
const saveBtn = document.getElementById('save');
const statusNode = document.getElementById('status');

let currentUser;

const LINK_TYPES = ['github', 'tiktok', 'youtube', 'roblox', 'steam', 'custom'];

const setStatus = (text, isError = false) => {
  statusNode.textContent = text;
  statusNode.style.color = isError ? '#ff8a8a' : '#98f0b0';
};

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

function addLinkRow(link = { type: 'github', url: '', logoUrl: '' }) {
  const row = document.createElement('div');
  row.className = 'row link-row';
  row.innerHTML = `
    <label>Type</label>
    <select class="link-type">
      ${LINK_TYPES.map((type) => `<option value="${type}" ${type === link.type ? 'selected' : ''}>${type}</option>`).join('')}
    </select>
    <label>URL</label>
    <input class="link-url" value="${link.url || ''}" placeholder="https://..." />
    <label>Custom logo URL (only custom type)</label>
    <input class="link-logo" value="${link.logoUrl || ''}" placeholder="https://..." />
    <button type="button" class="secondary remove-link">Remove</button>
  `;
  row.querySelector('.remove-link').addEventListener('click', () => row.remove());
  linksNode.appendChild(row);
}

function addTrackRow(track = {}) {
  const count = tracksNode.querySelectorAll('.track-row').length;
  if (count >= 15) {
    setStatus('Track limit reached (15 max).', true);
    return;
  }

  const row = document.createElement('div');
  row.className = 'row track-row';
  row.innerHTML = `
    <label>MP3 file</label>
    <input class="track-file" type="file" accept="audio/mp3,audio/mpeg" />
    <label>Album cover (image)</label>
    <input class="track-cover" type="file" accept="image/*" />
    <label>Song name</label>
    <input class="track-name" value="${track.name || ''}" />
    <label>Artist</label>
    <input class="track-artist" value="${track.artist || ''}" />
    <button type="button" class="secondary remove-track">Remove</button>
  `;
  row.querySelector('.remove-track').addEventListener('click', () => row.remove());
  tracksNode.appendChild(row);
}

async function uploadIfProvided(fileInput, path) {
  const file = fileInput.files?.[0];
  if (!file) {
    return '';
  }

  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

async function claimSubdomain(uid) {
  const requested = slugify(subdomainInput.value);
  if (!requested || requested.length < 2) {
    throw new Error('Subdomain must be at least 2 valid characters.');
  }

  const claimRef = doc(db, 'claims', requested);
  const userRef = doc(db, 'profiles', uid);

  await runTransaction(db, async (tx) => {
    const claimDoc = await tx.get(claimRef);
    if (claimDoc.exists() && claimDoc.data().uid !== uid) {
      throw new Error('That subdomain is already claimed.');
    }

    tx.set(claimRef, { uid, subdomain: requested, claimedAt: serverTimestamp() }, { merge: true });
    tx.set(userRef, { subdomain: requested, updatedAt: serverTimestamp() }, { merge: true });
  });

  return requested;
}

function collectLinks() {
  return [...linksNode.querySelectorAll('.link-row')].map((row) => ({
    type: row.querySelector('.link-type').value,
    url: row.querySelector('.link-url').value.trim(),
    logoUrl: row.querySelector('.link-logo').value.trim()
  })).filter((link) => link.url);
}

async function collectTracks(uid) {
  const rows = [...tracksNode.querySelectorAll('.track-row')];
  if (rows.length > 15) {
    throw new Error('You can only have up to 15 tracks.');
  }

  const tracks = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const mp3 = row.querySelector('.track-file').files?.[0];
    const cover = row.querySelector('.track-cover').files?.[0];

    let audioUrl = '';
    let coverUrl = '';

    if (mp3) {
      const audioRef = ref(storage, `users/${uid}/tracks/${Date.now()}-${i}-${mp3.name}`);
      await uploadBytes(audioRef, mp3);
      audioUrl = await getDownloadURL(audioRef);
    }

    if (cover) {
      const coverRef = ref(storage, `users/${uid}/covers/${Date.now()}-${i}-${cover.name}`);
      await uploadBytes(coverRef, cover);
      coverUrl = await getDownloadURL(coverRef);
    }

    tracks.push({
      name: row.querySelector('.track-name').value.trim() || `Track ${i + 1}`,
      artist: row.querySelector('.track-artist').value.trim() || 'Unknown artist',
      audioUrl,
      coverUrl
    });
  }

  return tracks;
}

async function saveProfile(uid) {
  const backgroundFile = backgroundInput.files?.[0];
  if (backgroundFile && backgroundFile.size > 25 * 1024 * 1024) {
    throw new Error('Background MP4 must be 25MB or less.');
  }

  const avatarUrl = await uploadIfProvided(avatarInput, `users/${uid}/avatar`);
  const backgroundUrl = await uploadIfProvided(backgroundInput, `users/${uid}/background.mp4`);
  const tracks = await collectTracks(uid);

  const payload = {
    username: usernameInput.value.trim(),
    avatarUrl,
    backgroundUrl,
    bios: [bio1Input.value.trim(), bio2Input.value.trim()].filter(Boolean),
    badges: ['early access'],
    links: collectLinks(),
    tracks,
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, 'profiles', uid), payload, { merge: true });
}

async function loadProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid));
  if (!snap.exists()) {
    addLinkRow();
    return;
  }

  const data = snap.data();
  subdomainInput.value = data.subdomain || '';
  usernameInput.value = data.username || '';
  bio1Input.value = data.bios?.[0] || '';
  bio2Input.value = data.bios?.[1] || '';

  (data.links || []).forEach(addLinkRow);
  if (!data.links?.length) {
    addLinkRow();
  }

  (data.tracks || []).forEach((track) => addTrackRow({ name: track.name, artist: track.artist }));
}

claimBtn.addEventListener('click', async () => {
  try {
    const subdomain = await claimSubdomain(currentUser.uid);
    setStatus(`Claimed: wolfiinator.github.io/wolf.lol/${subdomain}`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

saveBtn.addEventListener('click', async () => {
  try {
    await saveProfile(currentUser.uid);
    setStatus('Profile saved.');
  } catch (error) {
    setStatus(error.message, true);
  }
});

addLinkBtn.addEventListener('click', () => addLinkRow());
addTrackBtn.addEventListener('click', () => addTrackRow());
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = './auth.html';
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './auth.html';
    return;
  }

  currentUser = user;
  accountNode.textContent = `Logged in as ${user.email}`;
  await loadProfile(user.uid);
});
