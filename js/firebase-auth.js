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
  await deleteUser(auth.currentUser);
}

onAuthStateChanged(auth, (user) => {
  persistUser(user);
  dispatchAuthChange(user);
});

window.softGigglesAuth = {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneCode,
  verifyPhoneCode,
  signOut,
  deleteProfile
};
