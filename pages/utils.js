import { db } from '../firebase-config.js';
import { doc, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';

export const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

export async function claimSubdomain(uid, raw) {
  const slug = slugify(raw);
  if (slug.length < 2) throw new Error('Claim must be at least 2 chars.');

  const claimRef = doc(db, 'claims', slug);
  const profileRef = doc(db, 'profiles', uid);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(claimRef);
    if (existing.exists() && existing.data().uid !== uid) {
      throw new Error('Claim already taken.');
    }

    tx.set(claimRef, { uid, subdomain: slug, claimedAt: serverTimestamp() }, { merge: true });
    tx.set(profileRef, { subdomain: slug, badges: ['early access'], updatedAt: serverTimestamp() }, { merge: true });
  });

  return slug;
}
