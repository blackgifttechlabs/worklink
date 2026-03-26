import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBMZPxfNdkSOForFOfW3GhaZpvZTYPMpeg',
  authDomain: 'giggles-a5c40.firebaseapp.com',
  projectId: 'giggles-a5c40',
  storageBucket: 'giggles-a5c40.firebasestorage.app',
  messagingSenderId: '99280347898',
  appId: '1:99280347898:web:6b4722f5e95114c06f5f43'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storageKey = 'softgiggles_account';

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
  if (!user) return 'SoftGiggles Shopper';
  if (user.displayName) return normalizeName(user.displayName);
  if (user.email) {
    return normalizeName(user.email.split('@')[0].replace(/[._-]+/g, ' '));
  }
  if (user.phoneNumber) return user.phoneNumber;
  return 'SoftGiggles Shopper';
}

function persistUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify({
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
    .replace(/^-+|-+$/g, '') || 'softgiggles-shopper';
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
    provider: providerId
  };
}

function getCartDocId(account) {
  return slugifyIdentifier(account.name || account.email || account.phone || account.uid);
}

async function syncUserDocument(account, extra = {}) {
  if (!account.uid) return;
  const userRef = doc(db, 'users', account.uid);
  await setDoc(userRef, {
    uid: account.uid,
    name: account.name,
    email: account.email || '',
    phone: account.phone || '',
    provider: account.provider,
    cartCount: extra.cartCount ?? 0,
    wishlistCount: extra.wishlistCount ?? 0,
    updatedAt: serverTimestamp()
  }, { merge: true });
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

async function signOut() {
  await firebaseSignOut(auth);
}

async function deleteProfile() {
  if (!auth.currentUser) {
    throw new Error('No signed-in user found.');
  }
  const account = getAccountPayload(auth.currentUser);
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
  return {
    saved: !exists,
    wishlistCount: nextWishlistItems.length
  };
}

onAuthStateChanged(auth, (user) => {
  persistUser(user);
  if (user) {
    const account = getAccountPayload(user);
    syncUserDocument(account).catch(() => {});
  }
  dispatchAuthChange(user);
});

window.softGigglesAuth = {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneCode,
  verifyPhoneCode,
  signOut,
  deleteProfile,
  addToCart,
  toggleWishlist
};
