import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDD3a9ARK6FBJKmtuZ5v0Rnqjf8Xlp1LHA',
  authDomain: 'worklink-5e1ff.firebaseapp.com',
  projectId: 'worklink-5e1ff',
  storageBucket: 'worklink-5e1ff.firebasestorage.app',
  messagingSenderId: '1053395339078',
  appId: '1:1053395339078:web:9847166be24ca1e42c8747'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storageKey = 'softgiggles_account';
const PROVIDER_COUNTER_START = 3383;
const ADMIN_ACTIVITY_COLLECTION = 'adminActivity';
const ZIMBABWE_PROVINCES = [
  'Bulawayo',
  'Harare',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands'
];

let recaptchaVerifier = null;
let phoneConfirmationResult = null;

function normalizeName(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function fallbackNameFromUser(user) {
  if (!user) return 'WorkLinkUp User';
  if (user.displayName) return normalizeName(user.displayName);
  if (user.email) {
    return normalizeName(user.email.split('@')[0].replace(/[._-]+/g, ' '));
  }
  if (user.phoneNumber) return user.phoneNumber;
  return 'WorkLinkUp User';
}

function persistUser(user) {
  try {
    const existing = getStoredAccount() || {};
    if (!user) {
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify({
      ...existing,
      loggedIn: true,
      uid: user.uid,
      name: fallbackNameFromUser(user),
      email: user.email || '',
      phone: user.phoneNumber || '',
      provider: user.providerData[0]?.providerId || 'firebase'
    }));
  } catch (error) {
    // Ignore storage issues.
  }
}

function getStoredAccount() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function slugifyIdentifier(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'worklinkup-user';
}

function getAccountPayload(user = auth.currentUser) {
  const stored = getStoredAccount();
  const name = stored?.name || fallbackNameFromUser(user);
  const email = stored?.email || user?.email || '';
  const phone = stored?.phone || user?.phoneNumber || '';
  const providerId = stored?.provider || user?.providerData?.[0]?.providerId || 'firebase';
  return {
    uid: user?.uid || stored?.uid || '',
    name,
    email,
    phone,
    provider: providerId,
    providerProfileComplete: Boolean(stored?.providerProfileComplete),
    providerProvince: stored?.providerProvince || '',
    providerProvinceSlug: stored?.providerProvinceSlug || '',
    providerPublicId: stored?.providerPublicId || '',
    whatsappNumber: stored?.whatsappNumber || ''
  };
}

function persistAccountDetails(extra = {}) {
  try {
    const current = getStoredAccount() || {};
    localStorage.setItem(storageKey, JSON.stringify({
      ...current,
      ...extra
    }));
  } catch (error) {
    // Ignore storage issues.
  }
}

function normalizeProvince(value) {
  const clean = String(value || '').trim();
  if (!clean) return 'Harare';
  const exactMatch = ZIMBABWE_PROVINCES.find((province) => province.toLowerCase() === clean.toLowerCase());
  return exactMatch || clean;
}

function createConversationId(firstUid, secondUid) {
  return [String(firstUid || ''), String(secondUid || '')]
    .filter(Boolean)
    .sort()
    .join('__');
}

function mapProviderProfile(snapshot) {
  const data = snapshot.data();
  return {
    uid: snapshot.id,
    ...data
  };
}

function getCartDocId(account) {
  return slugifyIdentifier(account.name || account.email || account.phone || account.uid);
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function recordAdminActivity(type, payload = {}) {
  try {
    const createdAtMs = Number(payload.createdAtMs || Date.now());
    await addDoc(collection(db, ADMIN_ACTIVITY_COLLECTION), {
      type: String(type || 'activity').trim(),
      actorUid: String(payload.actorUid || '').trim(),
      actorName: String(payload.actorName || '').trim(),
      actorEmail: String(payload.actorEmail || '').trim(),
      subjectUid: String(payload.subjectUid || payload.actorUid || '').trim(),
      subjectName: String(payload.subjectName || payload.actorName || '').trim(),
      title: String(payload.title || '').trim(),
      description: String(payload.description || '').trim(),
      sourceRef: String(payload.sourceRef || '').trim(),
      createdAtMs,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    // Keep product flows working even if admin analytics writes fail.
  }
}

async function syncUserDocument(account, extra = {}) {
  if (!account.uid) return;
  const userRef = doc(db, 'users', account.uid);
  const existingSnapshot = await getDoc(userRef).catch(() => null);
  const existingUser = existingSnapshot?.exists() ? existingSnapshot.data() : null;
  const createdAtMs = Number(extra.createdAtMs ?? (existingUser?.createdAtMs || Date.now()));
  const updatedAtMs = Number(extra.updatedAtMs ?? Date.now());
  const lastSeenAtMs = Number(extra.lastSeenAtMs ?? existingUser?.lastSeenAtMs ?? 0);
  await setDoc(userRef, {
    uid: account.uid,
    name: account.name,
    email: account.email || '',
    phone: account.phone || '',
    provider: account.provider,
    cartCount: extra.cartCount ?? existingUser?.cartCount ?? 0,
    wishlistCount: extra.wishlistCount ?? existingUser?.wishlistCount ?? 0,
    providerProfileComplete: extra.providerProfileComplete ?? account.providerProfileComplete ?? false,
    providerProvince: extra.providerProvince ?? account.providerProvince ?? '',
    providerProvinceSlug: extra.providerProvinceSlug ?? account.providerProvinceSlug ?? '',
    providerPublicId: extra.providerPublicId ?? account.providerPublicId ?? '',
    whatsappNumber: extra.whatsappNumber ?? account.whatsappNumber ?? '',
    createdAtMs,
    updatedAtMs,
    lastSeenAtMs,
    createdAt: existingUser?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  if (!existingUser) {
    await recordAdminActivity('user_registered', {
      actorUid: account.uid,
      actorName: account.name,
      actorEmail: account.email || '',
      subjectUid: account.uid,
      subjectName: account.name,
      title: 'New user registered',
      description: `${account.name} created a WorkLinkUp account.`,
      sourceRef: `users/${account.uid}`,
      createdAtMs
    });
  }
}

async function readCartState(account) {
  const cartRef = doc(db, 'cart', getCartDocId(account));
  const snapshot = await getDoc(cartRef);
  const data = snapshot.exists() ? snapshot.data() : {};
  return {
    cartRef,
    cartItems: Array.isArray(data.cartItems) ? data.cartItems : [],
    wishlistItems: Array.isArray(data.wishlistItems) ? data.wishlistItems : []
  };
}

async function writeCartState(account, cartItems, wishlistItems) {
  const cartRef = doc(db, 'cart', getCartDocId(account));
  const updatedAtMs = Date.now();
  await setDoc(cartRef, {
    ownerName: account.name,
    accountDetails: {
      uid: account.uid,
      name: account.name,
      email: account.email || '',
      phone: account.phone || '',
      provider: account.provider
    },
    cartItems,
    wishlistItems,
    cartCount: cartItems.length,
    wishlistCount: wishlistItems.length,
    updatedAtMs,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await syncUserDocument(account, {
    cartCount: cartItems.length,
    wishlistCount: wishlistItems.length
  });
}

function dispatchAuthChange(user) {
  window.dispatchEvent(new CustomEvent('softgiggles-auth-changed', {
    detail: {
      user
    }
  }));
}

function ensureRecaptcha() {
  if (recaptchaVerifier) return recaptchaVerifier;
  recaptchaVerifier = new RecaptchaVerifier(auth, 'account-phone-submit', {
    size: 'invisible'
  });
  return recaptchaVerifier;
}

async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

async function signUpWithEmail(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(result.user, {
      displayName: normalizeName(name)
    });
  }
  return auth.currentUser || result.user;
}

async function sendPhoneCode(phoneNumber) {
  const verifier = ensureRecaptcha();
  phoneConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return phoneConfirmationResult;
}

async function verifyPhoneCode(code) {
  if (!phoneConfirmationResult) {
    throw new Error('Send the verification code first.');
  }
  const result = await phoneConfirmationResult.confirm(code);
  return result.user;
}

async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

async function getUserDocument(uid = auth.currentUser?.uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

async function getOrCreateProviderPublicId(uid) {
  if (!uid) throw new Error('No signed-in user found.');

  const userRef = doc(db, 'users', uid);
  const counterRef = doc(db, 'systemCounters', 'providers');

  return runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (userSnapshot.exists() && userSnapshot.data().providerPublicId) {
      return userSnapshot.data().providerPublicId;
    }

    const counterSnapshot = await transaction.get(counterRef);
    const nextNumber = (counterSnapshot.exists() ? Number(counterSnapshot.data().lastNumber || PROVIDER_COUNTER_START) : PROVIDER_COUNTER_START) + 1;
    const providerPublicId = `#${nextNumber}`;

    transaction.set(counterRef, {
      lastNumber: nextNumber,
      updatedAt: serverTimestamp()
    }, { merge: true });

    transaction.set(userRef, {
      uid,
      providerPublicId,
      providerIdNumber: nextNumber,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return providerPublicId;
  });
}

async function getProviderProfileByUid(uid, knownProvinceSlug = '') {
  if (!uid) return null;

  if (knownProvinceSlug) {
    const directSnapshot = await getDoc(doc(db, 'providers', knownProvinceSlug, 'profiles', uid));
    if (directSnapshot.exists()) return mapProviderProfile(directSnapshot);
  }

  const userDoc = await getUserDocument(uid);
  const provinceSlug = userDoc?.providerProvinceSlug || '';
  if (provinceSlug) {
    const directSnapshot = await getDoc(doc(db, 'providers', provinceSlug, 'profiles', uid));
    if (directSnapshot.exists()) return mapProviderProfile(directSnapshot);
  }

  const grouped = await getDocs(query(collectionGroup(db, 'profiles'), where('uid', '==', uid)));
  if (grouped.empty) return null;
  return mapProviderProfile(grouped.docs[0]);
}

async function listProviderPosts(uid, provinceSlug = '') {
  const providerProfile = await getProviderProfileByUid(uid, provinceSlug);
  if (!providerProfile) return [];
  const postsSnapshot = await getDocs(collection(db, 'providers', providerProfile.provinceSlug, 'profiles', providerProfile.uid, 'posts'));
  return postsSnapshot.docs
    .map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
}

function getProviderPostRef(providerProfile, postId) {
  return doc(db, 'providers', providerProfile.provinceSlug, 'profiles', providerProfile.uid, 'posts', postId);
}

async function saveProviderProfile(profileInput = {}) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }

  const account = getAccountPayload(auth.currentUser);
  const userRef = doc(db, 'users', account.uid);
  const existingUserDoc = await getUserDocument(account.uid);
  const existingProviderProfile = await getProviderProfileByUid(
    account.uid,
    existingUserDoc?.providerProvinceSlug || account.providerProvinceSlug || ''
  ).catch(() => null);
  const isNewProviderProfile = !existingProviderProfile;
  const province = normalizeProvince(profileInput.province);
  const provinceSlug = slugifyIdentifier(province);
  const providerPublicId = existingUserDoc?.providerPublicId || await getOrCreateProviderPublicId(account.uid);
  const displayName = normalizeName(profileInput.fullName || account.name);
  const providerRef = doc(db, 'providers', provinceSlug, 'profiles', account.uid);

  if (existingUserDoc?.providerProvinceSlug && existingUserDoc.providerProvinceSlug !== provinceSlug) {
    await deleteDoc(doc(db, 'providers', existingUserDoc.providerProvinceSlug, 'profiles', account.uid)).catch(() => {});
  }

  await setDoc(doc(db, 'providers', provinceSlug), {
    province,
    provinceSlug,
    updatedAt: serverTimestamp()
  }, { merge: true });

  const providerProfile = {
    uid: account.uid,
    providerPublicId,
    displayName,
    email: account.email || '',
    whatsappNumber: String(profileInput.whatsappNumber || account.phone || '').trim(),
    address: String(profileInput.address || '').trim(),
    city: String(profileInput.city || '').trim(),
    province,
    provinceSlug,
    experience: String(profileInput.experience || '').trim(),
    primaryCategory: String(profileInput.primaryCategory || '').trim(),
    specialty: String(profileInput.specialty || '').trim(),
    bio: String(profileInput.bio || '').trim(),
    profileImageData: String(profileInput.profileImageData || existingProviderProfile?.profileImageData || '').trim(),
    bannerImageData: String(profileInput.bannerImageData || existingProviderProfile?.bannerImageData || '').trim(),
    averageRating: Number(profileInput.averageRating || 4.8),
    reviewCount: Number(profileInput.reviewCount || 12),
    completedJobs: Number(profileInput.completedJobs || 8),
    createdAtMs: existingUserDoc?.createdAtMs || Date.now(),
    updatedAtMs: Date.now(),
    createdAt: existingUserDoc?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(providerRef, providerProfile, { merge: true });
  await setDoc(userRef, {
    uid: account.uid,
    name: displayName,
    email: account.email || '',
    phone: providerProfile.whatsappNumber,
    providerProfileComplete: true,
    providerProvince: province,
    providerProvinceSlug: provinceSlug,
    providerPublicId,
    whatsappNumber: providerProfile.whatsappNumber,
    address: providerProfile.address,
    city: providerProfile.city,
    experience: providerProfile.experience,
    primaryCategory: providerProfile.primaryCategory,
    specialty: providerProfile.specialty,
    bio: providerProfile.bio,
    createdAtMs: existingUserDoc?.createdAtMs || Date.now(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  persistAccountDetails({
    name: displayName,
    phone: providerProfile.whatsappNumber,
    providerProfileComplete: true,
    providerProvince: province,
    providerProvinceSlug: provinceSlug,
    providerPublicId,
    whatsappNumber: providerProfile.whatsappNumber
  });

  await recordAdminActivity(isNewProviderProfile ? 'provider_profile_created' : 'provider_profile_updated', {
    actorUid: account.uid,
    actorName: displayName,
    actorEmail: account.email || '',
    subjectUid: account.uid,
    subjectName: displayName,
    title: isNewProviderProfile ? 'Provider profile created' : 'Provider profile updated',
    description: `${displayName} ${isNewProviderProfile ? 'completed' : 'updated'} a provider profile in ${province}.`,
    sourceRef: `providers/${provinceSlug}/profiles/${account.uid}`,
    createdAtMs: providerProfile.updatedAtMs
  });

  return providerProfile;
}

async function updateProviderProfile(profileInput = {}) {
  return saveProviderProfile(profileInput);
}

async function listProviders() {
  const snapshot = await getDocs(collectionGroup(db, 'profiles'));
  return snapshot.docs
    .map(mapProviderProfile)
    .sort((first, second) => Number(second.averageRating || 0) - Number(first.averageRating || 0));
}

async function createProviderPost(payload = {}) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }

  const providerProfile = await getProviderProfileByUid(auth.currentUser.uid);
  if (!providerProfile) {
    throw new Error('Complete your provider profile before posting.');
  }

  const postsRef = collection(db, 'providers', providerProfile.provinceSlug, 'profiles', providerProfile.uid, 'posts');
  const now = Date.now();
  const postPayload = {
    providerUid: providerProfile.uid,
    providerPublicId: providerProfile.providerPublicId,
    providerName: providerProfile.displayName,
    provinceSlug: providerProfile.provinceSlug,
    caption: String(payload.caption || '').trim(),
    imageData: String(payload.imageData || '').trim(),
    createdAtMs: now,
    updatedAtMs: now,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const created = await addDoc(postsRef, postPayload);
  await recordAdminActivity('provider_post_created', {
    actorUid: providerProfile.uid,
    actorName: providerProfile.displayName,
    actorEmail: providerProfile.email || '',
    subjectUid: providerProfile.uid,
    subjectName: providerProfile.displayName,
    title: 'New work post published',
    description: `${providerProfile.displayName} posted new work for ${providerProfile.primaryCategory || 'their services'}.`,
    sourceRef: `providers/${providerProfile.provinceSlug}/profiles/${providerProfile.uid}/posts/${created.id}`,
    createdAtMs: now
  });
  return {
    id: created.id,
    ...postPayload
  };
}

async function updateProviderPost(postId, payload = {}) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }
  if (!postId) {
    throw new Error('No post selected.');
  }

  const providerProfile = await getProviderProfileByUid(auth.currentUser.uid);
  if (!providerProfile) {
    throw new Error('Complete your provider profile before editing posts.');
  }

  const nextPayload = {
    caption: String(payload.caption || '').trim(),
    updatedAtMs: Date.now(),
    updatedAt: serverTimestamp()
  };

  if (payload.imageData) {
    nextPayload.imageData = String(payload.imageData).trim();
  }

  await setDoc(getProviderPostRef(providerProfile, postId), nextPayload, { merge: true });
  const updatedSnapshot = await getDoc(getProviderPostRef(providerProfile, postId));
  await recordAdminActivity('provider_post_updated', {
    actorUid: providerProfile.uid,
    actorName: providerProfile.displayName,
    actorEmail: providerProfile.email || '',
    subjectUid: providerProfile.uid,
    subjectName: providerProfile.displayName,
    title: 'Work post updated',
    description: `${providerProfile.displayName} updated one of their work posts.`,
    sourceRef: `providers/${providerProfile.provinceSlug}/profiles/${providerProfile.uid}/posts/${postId}`,
    createdAtMs: nextPayload.updatedAtMs
  });
  return updatedSnapshot.exists() ? { id: updatedSnapshot.id, ...updatedSnapshot.data() } : null;
}

async function deleteProviderPost(postId) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }
  if (!postId) {
    throw new Error('No post selected.');
  }

  const providerProfile = await getProviderProfileByUid(auth.currentUser.uid);
  if (!providerProfile) {
    throw new Error('Complete your provider profile before deleting posts.');
  }

  await deleteDoc(getProviderPostRef(providerProfile, postId));
  await recordAdminActivity('provider_post_deleted', {
    actorUid: providerProfile.uid,
    actorName: providerProfile.displayName,
    actorEmail: providerProfile.email || '',
    subjectUid: providerProfile.uid,
    subjectName: providerProfile.displayName,
    title: 'Work post deleted',
    description: `${providerProfile.displayName} removed a work post.`,
    sourceRef: `providers/${providerProfile.provinceSlug}/profiles/${providerProfile.uid}/posts/${postId}`,
    createdAtMs: Date.now()
  });
  return { deleted: true, postId };
}

async function sendMessageToProvider(payload = {}) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }

  const sender = getAccountPayload(auth.currentUser);
  const recipientProfile = await getProviderProfileByUid(payload.toUid, payload.toProvinceSlug);
  const recipientName = recipientProfile?.displayName || String(payload.toName || 'Provider').trim();
  const recipientProvinceSlug = recipientProfile?.provinceSlug || String(payload.toProvinceSlug || '').trim();

  const conversationId = createConversationId(sender.uid, payload.toUid);
  const now = Date.now();
  const messagePayload = {
    conversationId,
    participants: [sender.uid, payload.toUid].sort(),
    fromUid: sender.uid,
    toUid: payload.toUid,
    fromName: sender.name,
    toName: recipientName,
    fromProvinceSlug: sender.providerProvinceSlug || '',
    toProvinceSlug: recipientProvinceSlug,
    text: String(payload.text || '').trim(),
    viewedAtMs: 0,
    createdAtMs: now,
    createdAt: serverTimestamp()
  };

  if (!messagePayload.text) {
    throw new Error('Type a message first.');
  }

  const created = await addDoc(collection(db, 'messages'), messagePayload);
  await recordAdminActivity('message_sent', {
    actorUid: sender.uid,
    actorName: sender.name,
    actorEmail: sender.email || '',
    subjectUid: payload.toUid,
    subjectName: recipientName,
    title: 'Message sent',
    description: `${sender.name} sent a message to ${recipientName}.`,
    sourceRef: `messages/${created.id}`,
    createdAtMs: now
  });
  return {
    id: created.id,
    ...messagePayload
  };
}

async function listMessagesWithUser(peerUid) {
  if (!auth.currentUser || !peerUid) return [];
  const conversationId = createConversationId(auth.currentUser.uid, peerUid);
  const snapshot = await getDocs(query(collection(db, 'messages'), where('conversationId', '==', conversationId)));
  return snapshot.docs
    .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
    .sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0));
}

async function markConversationViewed(peerUid) {
  if (!auth.currentUser || !peerUid) return { updated: 0 };
  const conversationId = createConversationId(auth.currentUser.uid, peerUid);
  const snapshot = await getDocs(query(collection(db, 'messages'), where('conversationId', '==', conversationId)));
  const pending = snapshot.docs.filter((docSnapshot) => {
    const data = docSnapshot.data();
    return data.toUid === auth.currentUser.uid && !Number(data.viewedAtMs || 0);
  });

  if (!pending.length) return { updated: 0 };

  const now = Date.now();
  await Promise.all(pending.map((docSnapshot) => updateDoc(docSnapshot.ref, {
    viewedAtMs: now,
    viewedAt: serverTimestamp()
  })));
  return { updated: pending.length, viewedAtMs: now };
}

async function listConversations() {
  if (!auth.currentUser) return [];
  const snapshot = await getDocs(query(collection(db, 'messages'), where('participants', 'array-contains', auth.currentUser.uid)));
  const conversations = new Map();

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const peerUid = data.fromUid === auth.currentUser.uid ? data.toUid : data.fromUid;
    const peerName = data.fromUid === auth.currentUser.uid ? data.toName : data.fromName;
    const peerProvinceSlug = data.fromUid === auth.currentUser.uid ? data.toProvinceSlug : data.fromProvinceSlug;
    const existing = conversations.get(data.conversationId) || {
      conversationId: data.conversationId,
      peerUid,
      peerName,
      peerProvinceSlug: peerProvinceSlug || '',
      lastMessage: '',
      createdAtMs: 0,
      unreadCount: 0,
      lastSeenAtMs: 0,
      lastMessageIsMine: false,
      lastMessageViewedAtMs: 0
    };

    if (data.toUid === auth.currentUser.uid && !Number(data.viewedAtMs || 0)) {
      existing.unreadCount += 1;
    }

    if (data.fromUid !== auth.currentUser.uid) {
      existing.lastSeenAtMs = Math.max(Number(existing.lastSeenAtMs || 0), Number(data.createdAtMs || 0));
    }

    if (Number(data.createdAtMs || 0) >= Number(existing.createdAtMs || 0)) {
      existing.peerUid = peerUid;
      existing.peerName = peerName;
      existing.peerProvinceSlug = peerProvinceSlug || existing.peerProvinceSlug || '';
      existing.lastMessage = data.text;
      existing.createdAtMs = data.createdAtMs;
      existing.lastMessageIsMine = data.fromUid === auth.currentUser.uid;
      existing.lastMessageViewedAtMs = Number(data.viewedAtMs || 0);
    }

    conversations.set(data.conversationId, existing);
  });

  return Array.from(conversations.values()).sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
}

async function signOut() {
  await firebaseSignOut(auth);
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    // Ignore storage issues.
  }
  dispatchAuthChange(null);
}

async function deleteProfile() {
  if (!auth.currentUser) {
    throw new Error('No signed-in user found.');
  }
  const account = getAccountPayload(auth.currentUser);
  await recordAdminActivity('profile_deleted', {
    actorUid: account.uid,
    actorName: account.name,
    actorEmail: account.email || '',
    subjectUid: account.uid,
    subjectName: account.name,
    title: 'Profile deleted',
    description: `${account.name} deleted their WorkLinkUp profile.`,
    sourceRef: `users/${account.uid}`,
    createdAtMs: Date.now()
  });
  if (account.uid) {
    await deleteDoc(doc(db, 'users', account.uid));
  }
  await deleteDoc(doc(db, 'cart', getCartDocId(account)));
  await deleteUser(auth.currentUser);
}

async function addToCart(product) {
  if (!auth.currentUser) {
    throw new Error('Please sign in to add items to your cart.');
  }
  const account = getAccountPayload(auth.currentUser);
  const { cartItems, wishlistItems } = await readCartState(account);
  const exists = cartItems.some((item) => item.id === product.id);
  const nextCartItems = exists
    ? cartItems.map((item) => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item)
    : [...cartItems, { ...product, quantity: 1, addedAt: new Date().toISOString() }];
  await writeCartState(account, nextCartItems, wishlistItems);
  await recordAdminActivity('cart_updated', {
    actorUid: account.uid,
    actorName: account.name,
    actorEmail: account.email || '',
    subjectUid: account.uid,
    subjectName: account.name,
    title: 'Cart updated',
    description: `${account.name} added ${product?.name || 'an item'} to the cart.`,
    sourceRef: `cart/${getCartDocId(account)}`,
    createdAtMs: Date.now()
  });
  return { cartCount: nextCartItems.length };
}

async function toggleWishlist(product) {
  if (!auth.currentUser) {
    throw new Error('Please sign in to manage your wishlist.');
  }
  const account = getAccountPayload(auth.currentUser);
  const { cartItems, wishlistItems } = await readCartState(account);
  const exists = wishlistItems.some((item) => item.id === product.id);
  const nextWishlistItems = exists
    ? wishlistItems.filter((item) => item.id !== product.id)
    : [...wishlistItems, { ...product, savedAt: new Date().toISOString() }];
  await writeCartState(account, cartItems, nextWishlistItems);
  await recordAdminActivity(exists ? 'wishlist_removed' : 'wishlist_saved', {
    actorUid: account.uid,
    actorName: account.name,
    actorEmail: account.email || '',
    subjectUid: account.uid,
    subjectName: account.name,
    title: exists ? 'Wishlist item removed' : 'Wishlist item saved',
    description: `${account.name} ${exists ? 'removed' : 'saved'} ${product?.name || 'an item'} ${exists ? 'from' : 'to'} the wishlist.`,
    sourceRef: `cart/${getCartDocId(account)}`,
    createdAtMs: Date.now()
  });
  return {
    saved: !exists,
    wishlistCount: nextWishlistItems.length
  };
}

onAuthStateChanged(auth, (user) => {
  persistUser(user);
  if (user) {
    const account = getAccountPayload(user);
    syncUserDocument(account, { lastSeenAtMs: Date.now() }).catch(() => {});
    getUserDocument(user.uid)
      .then((userDoc) => {
        if (!userDoc) return null;
        persistAccountDetails({
          name: userDoc.name || account.name,
          phone: userDoc.phone || account.phone,
          providerProfileComplete: Boolean(userDoc.providerProfileComplete),
          providerProvince: userDoc.providerProvince || '',
          providerProvinceSlug: userDoc.providerProvinceSlug || '',
          providerPublicId: userDoc.providerPublicId || '',
          whatsappNumber: userDoc.whatsappNumber || ''
        });
        return userDoc;
      })
      .then(async (userDoc) => {
        if (!userDoc) return;
        if (userDoc.providerProfileComplete) return;

        const providerProfile = await getProviderProfileByUid(user.uid, userDoc.providerProvinceSlug || '').catch(() => null);
        if (!providerProfile) return;

        const healedProfileState = {
          providerProfileComplete: true,
          providerProvince: providerProfile.province || userDoc.providerProvince || '',
          providerProvinceSlug: providerProfile.provinceSlug || userDoc.providerProvinceSlug || '',
          providerPublicId: providerProfile.providerPublicId || userDoc.providerPublicId || '',
          whatsappNumber: providerProfile.whatsappNumber || userDoc.whatsappNumber || ''
        };

        await setDoc(doc(db, 'users', user.uid), healedProfileState, { merge: true });
        persistAccountDetails(healedProfileState);
        dispatchAuthChange(user);
      })
      .catch(() => {});
  }
  dispatchAuthChange(user);
});

async function listUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs
    .map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        uid: docSnapshot.id,
        ...data,
        createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt)),
        updatedAtMs: Number(data.updatedAtMs || toMillis(data.updatedAt)),
        lastSeenAtMs: Number(data.lastSeenAtMs || 0)
      };
    })
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
}

async function listAdminActivity() {
  const snapshot = await getDocs(collection(db, ADMIN_ACTIVITY_COLLECTION));
  return snapshot.docs
    .map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt))
      };
    })
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
}

async function getAdminDashboardData() {
  const [users, providerSnapshot, postSnapshot, messageSnapshot, cartSnapshot, adminActivity] = await Promise.all([
    listUsers(),
    getDocs(collectionGroup(db, 'profiles')),
    getDocs(collectionGroup(db, 'posts')),
    getDocs(collection(db, 'messages')),
    getDocs(collection(db, 'cart')),
    listAdminActivity().catch(() => [])
  ]);

  const providers = providerSnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      uid: docSnapshot.id,
      ...data,
      createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt)),
      updatedAtMs: Number(data.updatedAtMs || toMillis(data.updatedAt))
    };
  });

  const posts = postSnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt)),
      updatedAtMs: Number(data.updatedAtMs || toMillis(data.updatedAt))
    };
  });

  const messages = messageSnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt)),
      viewedAtMs: Number(data.viewedAtMs || toMillis(data.viewedAt))
    };
  });

  const carts = cartSnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      updatedAtMs: Number(data.updatedAtMs || toMillis(data.updatedAt)),
      cartCount: Number(data.cartCount || (Array.isArray(data.cartItems) ? data.cartItems.length : 0)),
      wishlistCount: Number(data.wishlistCount || (Array.isArray(data.wishlistItems) ? data.wishlistItems.length : 0))
    };
  });

  const providerByUid = new Map(providers.map((providerProfile) => [providerProfile.uid, providerProfile]));
  const usersWithDetails = users.map((user) => {
    const providerProfile = providerByUid.get(user.uid);
    return {
      ...user,
      providerPublicId: user.providerPublicId || providerProfile?.providerPublicId || '',
      providerProvince: user.providerProvince || providerProfile?.province || '',
      city: user.city || providerProfile?.city || '',
      primaryCategory: user.primaryCategory || providerProfile?.primaryCategory || '',
      specialty: user.specialty || providerProfile?.specialty || '',
      createdAtMs: Number(user.createdAtMs || providerProfile?.createdAtMs || 0),
      updatedAtMs: Number(user.updatedAtMs || providerProfile?.updatedAtMs || 0),
      providerProfileComplete: Boolean(user.providerProfileComplete || providerProfile)
    };
  }).sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  const conversationCount = new Set(messages.map((message) => message.conversationId).filter(Boolean)).size;
  const unreadMessageCount = messages.filter((message) => !Number(message.viewedAtMs || 0)).length;
  const totalCartUnits = carts.reduce((sum, cartDoc) => sum + (Array.isArray(cartDoc.cartItems)
    ? cartDoc.cartItems.reduce((innerSum, item) => innerSum + Number(item.quantity || 0), 0)
    : Number(cartDoc.cartCount || 0)), 0);
  const totalWishlistSaves = carts.reduce((sum, cartDoc) => sum + Number(cartDoc.wishlistCount || 0), 0);

  const categoryBreakdownMap = new Map();
  providers.forEach((providerProfile) => {
    const key = String(providerProfile.primaryCategory || 'Uncategorized').trim() || 'Uncategorized';
    categoryBreakdownMap.set(key, (categoryBreakdownMap.get(key) || 0) + 1);
  });

  const provinceBreakdownMap = new Map();
  usersWithDetails.forEach((user) => {
    const key = String(user.providerProvince || user.city || 'Unknown').trim() || 'Unknown';
    provinceBreakdownMap.set(key, (provinceBreakdownMap.get(key) || 0) + 1);
  });

  const derivedActivity = [
    ...usersWithDetails.filter((user) => Number(user.createdAtMs || 0)).map((user) => ({
      type: 'user_registered',
      actorUid: user.uid,
      actorName: user.name,
      actorEmail: user.email || '',
      subjectUid: user.uid,
      subjectName: user.name,
      title: 'New user registered',
      description: `${user.name || 'A user'} created a WorkLinkUp account.`,
      sourceRef: `users/${user.uid}`,
      createdAtMs: Number(user.createdAtMs || 0)
    })),
    ...providers.filter((providerProfile) => Number(providerProfile.updatedAtMs || 0)).map((providerProfile) => ({
      type: 'provider_profile_updated',
      actorUid: providerProfile.uid,
      actorName: providerProfile.displayName,
      actorEmail: providerProfile.email || '',
      subjectUid: providerProfile.uid,
      subjectName: providerProfile.displayName,
      title: 'Provider profile updated',
      description: `${providerProfile.displayName || 'A provider'} updated a provider profile.`,
      sourceRef: `providers/${providerProfile.provinceSlug}/profiles/${providerProfile.uid}`,
      createdAtMs: Number(providerProfile.updatedAtMs || 0)
    })),
    ...posts.filter((post) => Number(post.createdAtMs || 0)).map((post) => ({
      type: 'provider_post_created',
      actorUid: post.providerUid,
      actorName: post.providerName,
      actorEmail: '',
      subjectUid: post.providerUid,
      subjectName: post.providerName,
      title: 'New work post published',
      description: `${post.providerName || 'A provider'} published a new work post.`,
      sourceRef: `providers/${post.provinceSlug}/profiles/${post.providerUid}/posts/${post.id}`,
      createdAtMs: Number(post.createdAtMs || 0)
    })),
    ...messages.filter((message) => Number(message.createdAtMs || 0)).map((message) => ({
      type: 'message_sent',
      actorUid: message.fromUid,
      actorName: message.fromName,
      actorEmail: '',
      subjectUid: message.toUid,
      subjectName: message.toName,
      title: 'Message sent',
      description: `${message.fromName || 'A user'} sent a message to ${message.toName || 'another user'}.`,
      sourceRef: `messages/${message.id}`,
      createdAtMs: Number(message.createdAtMs || 0)
    })),
    ...carts.filter((cartDoc) => Number(cartDoc.updatedAtMs || 0)).map((cartDoc) => ({
      type: 'cart_updated',
      actorUid: cartDoc.accountDetails?.uid || '',
      actorName: cartDoc.accountDetails?.name || cartDoc.ownerName || 'WorkLinkUp user',
      actorEmail: cartDoc.accountDetails?.email || '',
      subjectUid: cartDoc.accountDetails?.uid || '',
      subjectName: cartDoc.accountDetails?.name || cartDoc.ownerName || 'WorkLinkUp user',
      title: 'Cart or wishlist updated',
      description: `${cartDoc.accountDetails?.name || cartDoc.ownerName || 'A user'} changed cart or wishlist items.`,
      sourceRef: `cart/${cartDoc.id}`,
      createdAtMs: Number(cartDoc.updatedAtMs || 0)
    }))
  ];

  const activityMap = new Map();
  [...derivedActivity, ...adminActivity].forEach((activity) => {
    const key = activity.sourceRef || `${activity.type}:${activity.subjectUid || activity.actorUid}:${activity.createdAtMs}`;
    const current = activityMap.get(key);
    if (!current || Number(activity.createdAtMs || 0) > Number(current.createdAtMs || 0)) {
      activityMap.set(key, activity);
    }
  });

  const activityFeed = Array.from(activityMap.values())
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0))
    .slice(0, 300);

  return {
    metrics: {
      totalUsers: usersWithDetails.length,
      providerCount: providers.length,
      providerCompletionRate: usersWithDetails.length ? Math.round((providers.length / usersWithDetails.length) * 100) : 0,
      newUsersToday: usersWithDetails.filter((user) => Number(user.createdAtMs || 0) >= startOfTodayMs).length,
      activeUsers7d: usersWithDetails.filter((user) => Number(user.lastSeenAtMs || user.updatedAtMs || user.createdAtMs || 0) >= sevenDaysAgo).length,
      postCount: posts.length,
      postsToday: posts.filter((post) => Number(post.createdAtMs || 0) >= startOfTodayMs).length,
      messageCount: messages.length,
      unreadMessageCount,
      messagesToday: messages.filter((message) => Number(message.createdAtMs || 0) >= startOfTodayMs).length,
      conversationCount,
      cartCount: carts.filter((cartDoc) => Number(cartDoc.cartCount || 0) > 0).length,
      totalCartUnits,
      totalWishlistSaves
    },
    users: usersWithDetails,
    activity: activityFeed,
    categoryBreakdown: Array.from(categoryBreakdownMap.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((first, second) => second.total - first.total),
    provinceBreakdown: Array.from(provinceBreakdownMap.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((first, second) => second.total - first.total),
    recentUsers: usersWithDetails.slice(0, 6)
  };
}

window.softGigglesAuth = {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneCode,
  verifyPhoneCode,
  resetPassword,
  signOut,
  deleteProfile,
  addToCart,
  toggleWishlist,
  getUserDocument,
  listUsers,
  getProviderProfileByUid,
  saveProviderProfile,
  updateProviderProfile,
  listProviders,
  listProviderPosts,
  createProviderPost,
  updateProviderPost,
  deleteProviderPost,
  sendMessageToProvider,
  listMessagesWithUser,
  listConversations,
  markConversationViewed,
  listAdminActivity,
  getAdminDashboardData
};
