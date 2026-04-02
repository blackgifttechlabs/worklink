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
import {
  get,
  getDatabase,
  off,
  onValue,
  push,
  ref,
  set,
  update
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDD3a9ARK6FBJKmtuZ5v0Rnqjf8Xlp1LHA',
  authDomain: 'worklink-5e1ff.firebaseapp.com',
  databaseURL: 'https://worklink-5e1ff-default-rtdb.firebaseio.com',
  projectId: 'worklink-5e1ff',
  storageBucket: 'worklink-5e1ff.firebasestorage.app',
  messagingSenderId: '1053395339078',
  appId: '1:1053395339078:web:9847166be24ca1e42c8747'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const provider = new GoogleAuthProvider();
const storageKey = 'softgiggles_account';
const PROVIDER_COUNTER_START = 3383;
const ADMIN_ACTIVITY_COLLECTION = 'adminActivity';
const ADMINS_COLLECTION = 'admins';
const ADMIN_BOOTSTRAP_ID = 'primary-admin';
const ADMIN_BOOTSTRAP_PIN = '1677';
const MESSAGE_THREADS_PATH = 'messages';
const MESSAGE_INDEX_PATH = 'conversationIndex';
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
let legacyMessageMigrationPromise = null;

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

function getBootstrapAdminRecord() {
  return {
    id: ADMIN_BOOTSTRAP_ID,
    name: 'Admin 1',
    email: '',
    pin: ADMIN_BOOTSTRAP_PIN,
    role: 'Owner',
    active: true,
    createdAtMs: 0,
    createdBy: 'system'
  };
}

function normalizeAdminRecord(id, data = {}) {
  return {
    id,
    name: String(data.name || 'Admin').trim() || 'Admin',
    email: String(data.email || '').trim(),
    pin: String(data.pin || '').trim(),
    role: String(data.role || 'Admin').trim() || 'Admin',
    active: data.active !== false,
    createdBy: String(data.createdBy || '').trim(),
    createdAtMs: Number(data.createdAtMs || toMillis(data.createdAt))
  };
}

function normalizeRealtimeMessage(id, data = {}, conversationId = '') {
  return {
    id,
    conversationId: String(data.conversationId || conversationId || '').trim(),
    participants: Array.isArray(data.participants) ? data.participants : [],
    fromUid: String(data.fromUid || '').trim(),
    toUid: String(data.toUid || '').trim(),
    fromName: String(data.fromName || '').trim(),
    toName: String(data.toName || '').trim(),
    fromProvinceSlug: String(data.fromProvinceSlug || '').trim(),
    toProvinceSlug: String(data.toProvinceSlug || '').trim(),
    text: String(data.text || '').trim(),
    imageData: String(data.imageData || '').trim(),
    viewedAtMs: Number(data.viewedAtMs || 0),
    createdAtMs: Number(data.createdAtMs || 0)
  };
}

function getMessageSummary(message = {}) {
  const text = String(message.text || '').trim();
  const hasImage = Boolean(String(message.imageData || '').trim());

  if (text && hasImage) {
    return {
      lastMessage: text,
      lastMessageType: 'mixed'
    };
  }

  if (hasImage) {
    return {
      lastMessage: 'Photo',
      lastMessageType: 'image'
    };
  }

  return {
    lastMessage: text,
    lastMessageType: 'text'
  };
}

function buildConversationIndexMap(messages) {
  const indexMap = new Map();
  const orderedMessages = messages
    .slice()
    .sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0));

  orderedMessages.forEach((message) => {
    if (!message.conversationId || !message.fromUid || !message.toUid) return;

    const senderKey = `${message.fromUid}:${message.conversationId}`;
    const recipientKey = `${message.toUid}:${message.conversationId}`;
    const senderSummary = indexMap.get(senderKey) || {
      conversationId: message.conversationId,
      peerUid: message.toUid,
      peerName: message.toName,
      peerProvinceSlug: message.toProvinceSlug || '',
      lastMessage: '',
      lastMessageType: 'text',
      createdAtMs: 0,
      unreadCount: 0,
      lastSeenAtMs: 0,
      lastMessageIsMine: false,
      lastMessageViewedAtMs: 0
    };
    const recipientSummary = indexMap.get(recipientKey) || {
      conversationId: message.conversationId,
      peerUid: message.fromUid,
      peerName: message.fromName,
      peerProvinceSlug: message.fromProvinceSlug || '',
      lastMessage: '',
      lastMessageType: 'text',
      createdAtMs: 0,
      unreadCount: 0,
      lastSeenAtMs: 0,
      lastMessageIsMine: false,
      lastMessageViewedAtMs: 0
    };

    if (!Number(message.viewedAtMs || 0)) {
      recipientSummary.unreadCount += 1;
    }

    recipientSummary.lastSeenAtMs = Math.max(
      Number(recipientSummary.lastSeenAtMs || 0),
      Number(message.createdAtMs || 0)
    );

    const summary = getMessageSummary(message);

    if (Number(message.createdAtMs || 0) >= Number(senderSummary.createdAtMs || 0)) {
      senderSummary.lastMessage = summary.lastMessage;
      senderSummary.lastMessageType = summary.lastMessageType;
      senderSummary.createdAtMs = Number(message.createdAtMs || 0);
      senderSummary.lastMessageIsMine = true;
      senderSummary.lastMessageViewedAtMs = Number(message.viewedAtMs || 0);
    }

    if (Number(message.createdAtMs || 0) >= Number(recipientSummary.createdAtMs || 0)) {
      recipientSummary.lastMessage = summary.lastMessage;
      recipientSummary.lastMessageType = summary.lastMessageType;
      recipientSummary.createdAtMs = Number(message.createdAtMs || 0);
      recipientSummary.lastMessageIsMine = false;
      recipientSummary.lastMessageViewedAtMs = Number(message.viewedAtMs || 0);
    }

    indexMap.set(senderKey, senderSummary);
    indexMap.set(recipientKey, recipientSummary);
  });

  return indexMap;
}

function mapIndexEntriesByUser(indexMap) {
  const byUser = {};

  indexMap.forEach((value, key) => {
    const [uid, conversationId] = key.split(':');
    if (!uid || !conversationId) return;
    if (!byUser[uid]) byUser[uid] = {};
    byUser[uid][conversationId] = value;
  });

  return byUser;
}

async function ensureBootstrapAdmin() {
  const bootstrap = getBootstrapAdminRecord();
  await setDoc(doc(db, ADMINS_COLLECTION, ADMIN_BOOTSTRAP_ID), {
    name: bootstrap.name,
    email: bootstrap.email,
    pin: bootstrap.pin,
    role: bootstrap.role,
    active: true,
    createdBy: bootstrap.createdBy,
    createdAtMs: bootstrap.createdAtMs,
    createdAt: serverTimestamp()
  }, { merge: true }).catch(() => {});
  return bootstrap;
}

async function recordAdminActivity(type, payload = {}) {
  try {
    const createdAtMs = Number(payload.createdAtMs || Date.now());
    await addDoc(collection(db, ADMIN_ACTIVITY_COLLECTION), {
      type: String(type || 'activity').trim(),
      actorScope: String(payload.actorScope || '').trim() || (String(type || '').startsWith('admin_') ? 'admin' : 'user'),
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

async function listAdmins() {
  await ensureBootstrapAdmin();
  const snapshot = await getDocs(collection(db, ADMINS_COLLECTION));
  const admins = snapshot.docs
    .map((docSnapshot) => normalizeAdminRecord(docSnapshot.id, docSnapshot.data()))
    .filter((admin) => admin.active !== false)
    .sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0));

  if (!admins.some((admin) => admin.id === ADMIN_BOOTSTRAP_ID)) {
    admins.unshift(getBootstrapAdminRecord());
  }

  return admins;
}

async function resolveAdminByPin(pin) {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) return null;
  const admins = await listAdmins();
  return admins.find((admin) => admin.active !== false && admin.pin === cleanPin) || null;
}

async function createAdmin(input = {}, actorAdmin = null) {
  const name = normalizeName(input.name || '');
  const email = String(input.email || '').trim();
  const pin = String(input.pin || '').trim();

  if (!name) {
    throw new Error('Enter the admin name.');
  }

  if (!/^\d{4,8}$/.test(pin)) {
    throw new Error('Admin PIN must be 4 to 8 digits.');
  }

  const admins = await listAdmins();
  if (admins.some((admin) => admin.pin === pin)) {
    throw new Error('That PIN is already assigned to another admin.');
  }

  const createdAtMs = Date.now();
  const created = await addDoc(collection(db, ADMINS_COLLECTION), {
    name,
    email,
    pin,
    role: 'Admin',
    active: true,
    createdBy: String(actorAdmin?.name || 'Admin').trim(),
    createdAtMs,
    createdAt: serverTimestamp()
  });

  const createdAdmin = {
    id: created.id,
    name,
    email,
    pin,
    role: 'Admin',
    active: true,
    createdBy: String(actorAdmin?.name || 'Admin').trim(),
    createdAtMs
  };

  await recordAdminActivity('admin_created', {
    actorScope: 'admin',
    actorUid: String(actorAdmin?.id || ADMIN_BOOTSTRAP_ID),
    actorName: String(actorAdmin?.name || 'Admin 1'),
    actorEmail: String(actorAdmin?.email || ''),
    subjectUid: createdAdmin.id,
    subjectName: createdAdmin.name,
    title: 'Admin created',
    description: `${String(actorAdmin?.name || 'Admin 1')} created admin access for ${createdAdmin.name}.`,
    sourceRef: `admins/${createdAdmin.id}`,
    createdAtMs
  });

  return createdAdmin;
}

async function recordAdminConsoleAction(input = {}) {
  await recordAdminActivity(String(input.type || 'admin_action'), {
    actorScope: 'admin',
    actorUid: String(input.admin?.id || ''),
    actorName: String(input.admin?.name || 'Admin'),
    actorEmail: String(input.admin?.email || ''),
    subjectUid: String(input.subjectUid || input.admin?.id || ''),
    subjectName: String(input.subjectName || input.admin?.name || 'Admin'),
    title: String(input.title || 'Admin action'),
    description: String(input.description || 'An admin action was recorded.'),
    sourceRef: String(input.sourceRef || ''),
    createdAtMs: Number(input.createdAtMs || Date.now())
  });
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

function waitForAuthSession(expectedUid = '', timeoutMs = 12000) {
  const normalizedUid = String(expectedUid || '').trim();
  if (!normalizedUid) {
    return Promise.resolve(auth.currentUser || null);
  }

  if (auth.currentUser?.uid === normalizedUid) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = 0;

    const finish = (user) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('softgiggles-auth-changed', handleAuthChanged);
      if (timeoutId) window.clearTimeout(timeoutId);
      resolve(user || null);
    };

    const handleAuthChanged = (event) => {
      const user = event?.detail?.user || null;
      if (user?.uid === normalizedUid) {
        finish(user);
      }
    };

    window.addEventListener('softgiggles-auth-changed', handleAuthChanged);
    timeoutId = window.setTimeout(() => {
      finish(auth.currentUser?.uid === normalizedUid ? auth.currentUser : null);
    }, Math.max(1000, Number(timeoutMs || 12000)));
  });
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

async function listAllRealtimeMessages() {
  const snapshot = await get(ref(realtimeDb, MESSAGE_THREADS_PATH));
  if (!snapshot.exists()) return [];

  const messages = [];
  const conversations = snapshot.val() || {};

  Object.entries(conversations).forEach(([conversationId, conversationMessages]) => {
    if (!conversationMessages || typeof conversationMessages !== 'object') return;

    Object.entries(conversationMessages).forEach(([messageId, messageData]) => {
      messages.push(normalizeRealtimeMessage(messageId, messageData, conversationId));
    });
  });

  return messages.sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0));
}

async function rebuildConversationIndexesFromRealtime() {
  const messages = await listAllRealtimeMessages();
  const nextIndex = mapIndexEntriesByUser(buildConversationIndexMap(messages));
  await set(ref(realtimeDb, MESSAGE_INDEX_PATH), nextIndex);
  return messages;
}

async function ensureRealtimeMessagesMigrated() {
  if (legacyMessageMigrationPromise) return legacyMessageMigrationPromise;

  legacyMessageMigrationPromise = (async () => {
    const [legacySnapshot, realtimeSnapshot] = await Promise.all([
      getDocs(collection(db, 'messages')).catch(() => null),
      get(ref(realtimeDb, MESSAGE_THREADS_PATH)).catch(() => null)
    ]);

    const realtimeConversationMap = realtimeSnapshot?.exists() ? realtimeSnapshot.val() || {} : {};
    const missingLegacyMessages = [];

    if (legacySnapshot && !legacySnapshot.empty) {
      legacySnapshot.docs.forEach((docSnapshot) => {
        const legacyMessage = normalizeRealtimeMessage(docSnapshot.id, docSnapshot.data(), docSnapshot.data().conversationId || '');
        if (!legacyMessage.conversationId) return;
        const existsInRealtime = Boolean(realtimeConversationMap?.[legacyMessage.conversationId]?.[legacyMessage.id]);
        if (!existsInRealtime) {
          missingLegacyMessages.push(legacyMessage);
        }
      });
    }

    if (missingLegacyMessages.length) {
      await Promise.all(missingLegacyMessages.map((message) => set(
        ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${message.conversationId}/${message.id}`),
        {
          conversationId: message.conversationId,
          participants: message.participants,
          fromUid: message.fromUid,
          toUid: message.toUid,
          fromName: message.fromName,
          toName: message.toName,
          fromProvinceSlug: message.fromProvinceSlug,
          toProvinceSlug: message.toProvinceSlug,
          text: message.text,
          imageData: message.imageData,
          viewedAtMs: Number(message.viewedAtMs || 0),
          createdAtMs: Number(message.createdAtMs || 0)
        }
      )));
    }

    await rebuildConversationIndexesFromRealtime();
  })();

  return legacyMessageMigrationPromise;
}

async function sendMessageToProvider(payload = {}) {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }

  const sender = getAccountPayload(auth.currentUser);
  const [recipientProfile, recipientUserDoc] = await Promise.all([
    getProviderProfileByUid(payload.toUid, payload.toProvinceSlug).catch(() => null),
    getUserDocument(payload.toUid).catch(() => null)
  ]);
  const recipientName = recipientProfile?.displayName
    || String(recipientUserDoc?.name || '').trim()
    || String(payload.toName || 'WorkLinkUp user').trim();
  const recipientProvinceSlug = recipientProfile?.provinceSlug
    || String(recipientUserDoc?.providerProvinceSlug || '').trim()
    || String(payload.toProvinceSlug || '').trim();

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
    imageData: String(payload.imageData || '').trim(),
    viewedAtMs: 0,
    createdAtMs: now,
    createdAt: serverTimestamp()
  };

  if (!messagePayload.text && !messagePayload.imageData) {
    throw new Error('Type a message or choose a photo first.');
  }

  await ensureRealtimeMessagesMigrated();

  const conversationRef = ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${conversationId}`);
  const createdRef = push(conversationRef);
  const createdId = createdRef.key;

  await set(createdRef, {
    ...messagePayload
  });

  const summary = getMessageSummary(messagePayload);

  const [senderIndexSnapshot, recipientIndexSnapshot] = await Promise.all([
    get(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${sender.uid}/${conversationId}`)),
    get(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${payload.toUid}/${conversationId}`))
  ]);

  const senderIndex = senderIndexSnapshot.exists() ? senderIndexSnapshot.val() : {};
  const recipientIndex = recipientIndexSnapshot.exists() ? recipientIndexSnapshot.val() : {};

  await Promise.all([
    set(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${sender.uid}/${conversationId}`), {
      conversationId,
      peerUid: payload.toUid,
      peerName: recipientName,
      peerProvinceSlug: recipientProvinceSlug,
      lastMessage: summary.lastMessage,
      lastMessageType: summary.lastMessageType,
      createdAtMs: now,
      unreadCount: Number(senderIndex.unreadCount || 0),
      lastSeenAtMs: Number(senderIndex.lastSeenAtMs || 0),
      lastMessageIsMine: true,
      lastMessageViewedAtMs: now
    }),
    set(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${payload.toUid}/${conversationId}`), {
      conversationId,
      peerUid: sender.uid,
      peerName: sender.name,
      peerProvinceSlug: sender.providerProvinceSlug || '',
      lastMessage: summary.lastMessage,
      lastMessageType: summary.lastMessageType,
      createdAtMs: now,
      unreadCount: Number(recipientIndex.unreadCount || 0) + 1,
      lastSeenAtMs: Math.max(Number(recipientIndex.lastSeenAtMs || 0), now),
      lastMessageIsMine: false,
      lastMessageViewedAtMs: 0
    })
  ]);

  await recordAdminActivity('message_sent', {
    actorUid: sender.uid,
    actorName: sender.name,
    actorEmail: sender.email || '',
    subjectUid: payload.toUid,
    subjectName: recipientName,
    title: 'Message sent',
    description: `${sender.name} sent a message to ${recipientName}.`,
    sourceRef: `messages/${conversationId}/${createdId}`,
    createdAtMs: now
  });
  return {
    id: createdId,
    ...messagePayload
  };
}

async function listMessagesWithUser(peerUid) {
  if (!auth.currentUser || !peerUid) return [];
  await ensureRealtimeMessagesMigrated();
  const conversationId = createConversationId(auth.currentUser.uid, peerUid);
  const snapshot = await get(ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${conversationId}`));
  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val() || {})
    .map(([messageId, messageData]) => normalizeRealtimeMessage(messageId, messageData, conversationId))
    .sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0));
}

async function markConversationViewed(peerUid) {
  if (!auth.currentUser || !peerUid) return { updated: 0 };
  await ensureRealtimeMessagesMigrated();
  const conversationId = createConversationId(auth.currentUser.uid, peerUid);
  const snapshot = await get(ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${conversationId}`));
  if (!snapshot.exists()) return { updated: 0 };

  const pending = Object.entries(snapshot.val() || {})
    .map(([messageId, messageData]) => normalizeRealtimeMessage(messageId, messageData, conversationId))
    .filter((message) => message.toUid === auth.currentUser.uid && !Number(message.viewedAtMs || 0));

  if (!pending.length) return { updated: 0 };

  const now = Date.now();
  const messageUpdates = {};
  pending.forEach((message) => {
    messageUpdates[`${message.id}/viewedAtMs`] = now;
  });
  await update(ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${conversationId}`), messageUpdates);
  await update(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${auth.currentUser.uid}/${conversationId}`), {
    unreadCount: 0,
    lastSeenAtMs: pending.reduce((latest, message) => Math.max(latest, Number(message.createdAtMs || 0)), 0),
    lastMessageViewedAtMs: now
  });
  return { updated: pending.length, viewedAtMs: now };
}

async function listConversations() {
  if (!auth.currentUser) return [];
  await ensureRealtimeMessagesMigrated();
  const snapshot = await get(ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${auth.currentUser.uid}`));
  if (!snapshot.exists()) return [];

  return Object.values(snapshot.val() || {})
    .map((conversation) => ({
      conversationId: String(conversation.conversationId || '').trim(),
      peerUid: String(conversation.peerUid || '').trim(),
      peerName: String(conversation.peerName || '').trim(),
      peerProvinceSlug: String(conversation.peerProvinceSlug || '').trim(),
      lastMessage: String(conversation.lastMessage || '').trim(),
      lastMessageType: String(conversation.lastMessageType || 'text').trim(),
      createdAtMs: Number(conversation.createdAtMs || 0),
      unreadCount: Number(conversation.unreadCount || 0),
      lastSeenAtMs: Number(conversation.lastSeenAtMs || 0),
      lastMessageIsMine: Boolean(conversation.lastMessageIsMine),
      lastMessageViewedAtMs: Number(conversation.lastMessageViewedAtMs || 0)
    }))
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));
}

async function subscribeMessagesWithUser(peerUid, callback) {
  if (!auth.currentUser || !peerUid || typeof callback !== 'function') return () => {};
  await ensureRealtimeMessagesMigrated();
  const conversationId = createConversationId(auth.currentUser.uid, peerUid);
  const targetRef = ref(realtimeDb, `${MESSAGE_THREADS_PATH}/${conversationId}`);
  const handler = (snapshot) => {
    const messages = snapshot.exists()
      ? Object.entries(snapshot.val() || {})
        .map(([messageId, messageData]) => normalizeRealtimeMessage(messageId, messageData, conversationId))
        .sort((first, second) => Number(first.createdAtMs || 0) - Number(second.createdAtMs || 0))
      : [];
    callback(messages);
  };

  onValue(targetRef, handler);
  return () => off(targetRef, 'value', handler);
}

async function subscribeConversations(callback) {
  if (!auth.currentUser || typeof callback !== 'function') return () => {};
  await ensureRealtimeMessagesMigrated();
  const targetRef = ref(realtimeDb, `${MESSAGE_INDEX_PATH}/${auth.currentUser.uid}`);
  const handler = (snapshot) => {
    const conversations = snapshot.exists()
      ? Object.values(snapshot.val() || {})
        .map((conversation) => ({
          conversationId: String(conversation.conversationId || '').trim(),
          peerUid: String(conversation.peerUid || '').trim(),
          peerName: String(conversation.peerName || '').trim(),
          peerProvinceSlug: String(conversation.peerProvinceSlug || '').trim(),
          lastMessage: String(conversation.lastMessage || '').trim(),
          lastMessageType: String(conversation.lastMessageType || 'text').trim(),
          createdAtMs: Number(conversation.createdAtMs || 0),
          unreadCount: Number(conversation.unreadCount || 0),
          lastSeenAtMs: Number(conversation.lastSeenAtMs || 0),
          lastMessageIsMine: Boolean(conversation.lastMessageIsMine),
          lastMessageViewedAtMs: Number(conversation.lastMessageViewedAtMs || 0)
        }))
        .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0))
      : [];
    callback(conversations);
  };

  onValue(targetRef, handler);
  return () => off(targetRef, 'value', handler);
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
  await ensureRealtimeMessagesMigrated();

  const [users, providerSnapshot, postSnapshot, messages, cartSnapshot, adminActivity, admins] = await Promise.all([
    listUsers(),
    getDocs(collectionGroup(db, 'profiles')),
    getDocs(collectionGroup(db, 'posts')),
    listAllRealtimeMessages(),
    getDocs(collection(db, 'cart')),
    listAdminActivity().catch(() => []),
    listAdmins().catch(() => [getBootstrapAdminRecord()])
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
  const adminAudit = adminActivity
    .filter((item) => String(item.type || '').startsWith('admin_') || String(item.actorScope || '') === 'admin')
    .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0));

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
    admins,
    adminAudit,
    providers,
    posts,
    messages,
    carts,
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
  resolveAdminByPin,
  listAdmins,
  createAdmin,
  recordAdminConsoleAction,
  waitForAuthSession,
  sendMessageToProvider,
  listMessagesWithUser,
  listConversations,
  markConversationViewed,
  subscribeMessagesWithUser,
  subscribeConversations,
  listAdminActivity,
  getAdminDashboardData
};
