import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const ui = {
  authClaimPanel: document.getElementById("auth-claim-panel"),
  profilePanel: document.getElementById("profile-panel"),
  editorPanel: document.getElementById("editor-panel"),
  loginButton: document.getElementById("login-button"),
  logoutButton: document.getElementById("logout-button"),
  claimForm: document.getElementById("claim-form"),
  domainInput: document.getElementById("domain-input"),
  authClaimMessage: document.getElementById("auth-claim-message"),
  editorForm: document.getElementById("editor-form"),
  editorMessage: document.getElementById("editor-message"),
  profilePicture: document.getElementById("profile-picture"),
  displayName: document.getElementById("display-name"),
  typewriterBio: document.getElementById("typewriter-bio"),
  profileLink: document.getElementById("profile-link"),
  nameInput: document.getElementById("name-input"),
  pictureInput: document.getElementById("picture-input"),
  backgroundInput: document.getElementById("background-input"),
  bio1Input: document.getElementById("bio1-input"),
  bio2Input: document.getElementById("bio2-input")
};

const fallbackProfile = {
  name: "unnamed wolf",
  pictureUrl: "assets/profile.gif",
  backgroundUrl: "",
  bio1: "type your first bio",
  bio2: "type your second bio"
};

let currentUser = null;
let activeDomain = resolveDomainFromPath();
let typewriterTimer = null;

function resolveDomainFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const maybeDomain = parts[parts.length - 1] || "";
  return /^\d+$/.test(maybeDomain) ? maybeDomain : "";
}

function setMessage(node, message, isError = false) {
  node.textContent = message;
  node.style.color = isError ? "#ff9ca8" : "#b8fff0";
}

function startTypewriterCycle(bio1, bio2) {
  const bios = [bio1, bio2].filter(Boolean);
  if (!bios.length) {
    ui.typewriterBio.textContent = "";
    return;
  }

  let bioIndex = 0;
  let charIndex = 0;
  let deleting = false;

  clearInterval(typewriterTimer);
  typewriterTimer = setInterval(() => {
    const activeBio = bios[bioIndex];
    if (!deleting) {
      charIndex += 1;
      ui.typewriterBio.textContent = activeBio.slice(0, charIndex);
      if (charIndex >= activeBio.length) {
        deleting = true;
      }
      return;
    }

    charIndex -= 1;
    ui.typewriterBio.textContent = activeBio.slice(0, Math.max(charIndex, 0));
    if (charIndex <= 0) {
      deleting = false;
      bioIndex = (bioIndex + 1) % bios.length;
    }
  }, 60);
}

function applyProfileToView(profile) {
  ui.displayName.textContent = profile.name || fallbackProfile.name;
  ui.profilePicture.src = profile.pictureUrl || fallbackProfile.pictureUrl;
  ui.profilePicture.onerror = () => {
    ui.profilePicture.src = fallbackProfile.pictureUrl;
  };

  const backgroundUrl = profile.backgroundUrl || "";
  if (backgroundUrl) {
    document.body.style.backgroundImage = `url('${backgroundUrl}')`;
  } else {
    document.body.style.backgroundImage = "";
  }

  startTypewriterCycle(profile.bio1 || "", profile.bio2 || "");
}

function applyProfileToEditor(profile) {
  ui.nameInput.value = profile.name || "";
  ui.pictureInput.value = profile.pictureUrl || "";
  ui.backgroundInput.value = profile.backgroundUrl || "";
  ui.bio1Input.value = profile.bio1 || "";
  ui.bio2Input.value = profile.bio2 || "";
}

async function loadDomainProfile(domain) {
  const snapshot = await getDoc(doc(db, "domains", domain));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
}

async function refreshPageState() {
  const hasDomain = Boolean(activeDomain);

  ui.logoutButton.hidden = !currentUser;
  ui.loginButton.hidden = Boolean(currentUser);
  ui.domainInput.value = activeDomain || "";

  if (!hasDomain) {
    ui.profilePanel.hidden = true;
    ui.editorPanel.hidden = true;
    setMessage(ui.authClaimMessage, "Choose a number and claim your domain.");
    return;
  }

  const profile = await loadDomainProfile(activeDomain);
  if (!profile) {
    ui.profilePanel.hidden = true;
    ui.editorPanel.hidden = true;
    setMessage(ui.authClaimMessage, `/${activeDomain} is not claimed yet. Sign in and claim it.`, true);
    return;
  }

  ui.profilePanel.hidden = false;
  ui.profileLink.textContent = `Live profile: ${window.location.origin}/wolf.lol/${activeDomain}`;
  applyProfileToView({ ...fallbackProfile, ...profile });

  const isOwner = currentUser?.uid && profile.ownerUid === currentUser.uid;
  ui.editorPanel.hidden = !isOwner;

  if (isOwner) {
    applyProfileToEditor({ ...fallbackProfile, ...profile });
    setMessage(ui.editorMessage, "You own this domain. Update your profile below.");
  }
}

ui.loginButton.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    setMessage(ui.authClaimMessage, "Signed in.");
  } catch (error) {
    setMessage(ui.authClaimMessage, error.message, true);
  }
});

ui.logoutButton.addEventListener("click", async () => {
  await signOut(auth);
  setMessage(ui.authClaimMessage, "Signed out.");
});

ui.claimForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    setMessage(ui.authClaimMessage, "Please sign in first.", true);
    return;
  }

  const requestedDomain = ui.domainInput.value.trim();
  if (!/^\d+$/.test(requestedDomain)) {
    setMessage(ui.authClaimMessage, "Domain must be numbers only (example: 1).", true);
    return;
  }

  const ref = doc(db, "domains", requestedDomain);
  const existing = await getDoc(ref);

  if (existing.exists() && existing.data().ownerUid !== currentUser.uid) {
    setMessage(ui.authClaimMessage, `/${requestedDomain} is already claimed.`, true);
    return;
  }

  if (!existing.exists()) {
    await setDoc(ref, {
      ownerUid: currentUser.uid,
      ownerEmail: currentUser.email,
      createdAt: serverTimestamp(),
      ...fallbackProfile
    });
  }

  activeDomain = requestedDomain;
  window.history.replaceState({}, "", `${window.location.origin}/wolf.lol/${requestedDomain}`);
  setMessage(ui.authClaimMessage, `Domain /${requestedDomain} ready.`);
  await refreshPageState();
});

ui.editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || !activeDomain) {
    setMessage(ui.editorMessage, "You must be signed in to save.", true);
    return;
  }

  const ref = doc(db, "domains", activeDomain);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists() || snapshot.data().ownerUid !== currentUser.uid) {
    setMessage(ui.editorMessage, "You do not own this domain.", true);
    return;
  }

  const payload = {
    name: ui.nameInput.value.trim() || fallbackProfile.name,
    pictureUrl: ui.pictureInput.value.trim() || fallbackProfile.pictureUrl,
    backgroundUrl: ui.backgroundInput.value.trim(),
    bio1: ui.bio1Input.value.trim(),
    bio2: ui.bio2Input.value.trim(),
    updatedAt: serverTimestamp()
  };

  await updateDoc(ref, payload);
  applyProfileToView(payload);
  setMessage(ui.editorMessage, "Profile saved.");
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  await refreshPageState();
});
