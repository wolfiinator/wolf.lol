import { db } from '../firebase-config.js';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';

const CLAIMS_KEY = 'wolf_lol_claims';
const PROFILES_KEY = 'wolf_lol_profiles';

const readJson = (key) => JSON.parse(localStorage.getItem(key) || '{}');
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const isMissingDbError = (error) => {
  const msg = `${error?.message || ''}`.toLowerCase();
  return msg.includes('database (default) does not exist') || msg.includes('failed-precondition');
};

export const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

function localClaim(uid, slug) {
  const claims = readJson(CLAIMS_KEY);
  if (claims[slug] && claims[slug].uid !== uid) {
    throw new Error('Claim already taken.');
  }

  claims[slug] = { uid, subdomain: slug, claimedAt: Date.now() };
  writeJson(CLAIMS_KEY, claims);

  const profiles = readJson(PROFILES_KEY);
  profiles[uid] = { ...(profiles[uid] || {}), subdomain: slug, badges: ['early access'], updatedAt: Date.now() };
  writeJson(PROFILES_KEY, profiles);
}

export async function claimSubdomain(uid, raw) {
  const slug = slugify(raw);
  if (slug.length < 2) throw new Error('Claim must be at least 2 chars.');

  const claimRef = doc(db, 'claims', slug);
  const profileRef = doc(db, 'profiles', uid);

  try {
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(claimRef);
      if (existing.exists() && existing.data().uid !== uid) {
        throw new Error('Claim already taken.');
      }

      tx.set(claimRef, { uid, subdomain: slug, claimedAt: serverTimestamp() }, { merge: true });
      tx.set(profileRef, { subdomain: slug, badges: ['early access'], updatedAt: serverTimestamp() }, { merge: true });
    });
  } catch (error) {
    if (!isMissingDbError(error)) {
      throw error;
    }
    localClaim(uid, slug);
  }

  return slug;
}

export async function saveProfile(uid, payload) {
  try {
    await setDoc(doc(db, 'profiles', uid), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    if (!isMissingDbError(error)) {
      throw error;
    }

    const profiles = readJson(PROFILES_KEY);
    profiles[uid] = { ...(profiles[uid] || {}), ...payload, updatedAt: Date.now() };
    writeJson(PROFILES_KEY, profiles);
  }
}

export async function getProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    if (!isMissingDbError(error)) {
      throw error;
    }

    const profiles = readJson(PROFILES_KEY);
    return profiles[uid] || null;
  }
}

export async function getProfileBySlug(slug) {
  try {
    const claim = await getDoc(doc(db, 'claims', slug));
    if (!claim.exists()) return null;
    const uid = claim.data().uid;
    const profile = await getDoc(doc(db, 'profiles', uid));
    return profile.exists() ? profile.data() : null;
  } catch (error) {
    if (!isMissingDbError(error)) {
      throw error;
    }

    const claims = readJson(CLAIMS_KEY);
    const claim = claims[slug];
    if (!claim) return null;

    const profiles = readJson(PROFILES_KEY);
    return profiles[claim.uid] || null;
  }
}

export { isMissingDbError };
