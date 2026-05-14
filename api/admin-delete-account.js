const admin = require('firebase-admin');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'worklink-5e1ff';
const BOOTSTRAP_ADMIN_PIN = process.env.ADMIN_BOOTSTRAP_PIN || '1677';
const ADMINS_COLLECTION = 'admins';
const ADMIN_ACTIVITY_COLLECTION = 'adminActivity';

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body);
  if (typeof request.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(request.body));
    } catch (error) {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        resolve({});
      }
    });
  });
}

function getServiceAccountCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    return admin.credential.cert({
      ...parsed,
      private_key: String(parsed.private_key || '').replace(/\\n/g, '\n')
    });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return admin.credential.cert({
      projectId: PROJECT_ID,
      clientEmail,
      privateKey: String(privateKey).replace(/\\n/g, '\n')
    });
  }

  return admin.credential.applicationDefault();
}

function getFirebaseApp() {
  if (admin.apps.length) return admin.apps[0];
  return admin.initializeApp({
    credential: getServiceAccountCredential(),
    projectId: PROJECT_ID
  });
}

async function assertAdminPin(db, pin) {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) return null;
  if (cleanPin === BOOTSTRAP_ADMIN_PIN) {
    return { id: 'primary-admin', name: 'Admin 1', email: '', role: 'Owner' };
  }

  const snapshot = await db.collection(ADMINS_COLLECTION).where('pin', '==', cleanPin).limit(1).get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data() || {};
  if (data.active === false) return null;

  return {
    id: doc.id,
    name: String(data.name || 'Admin').trim() || 'Admin',
    email: String(data.email || '').trim(),
    role: String(data.role || 'Admin').trim() || 'Admin'
  };
}

async function recursiveDelete(db, ref, deletedRefs) {
  await db.recursiveDelete(ref);
  deletedRefs.push(ref.path);
}

async function deleteQuery(db, query, deletedRefs) {
  const snapshot = await query.get();
  await Promise.all(snapshot.docs.map((docSnapshot) => recursiveDelete(db, docSnapshot.ref, deletedRefs)));
}

async function deleteFirestoreAccountData(db, uid, userDoc) {
  const deletedRefs = [];
  const knownCartDocIds = [
    uid,
    userDoc.userPublicId,
    userDoc.userDocumentName,
    userDoc.username,
    userDoc.name,
    userDoc.email,
    userDoc.phone
  ].filter(Boolean).map((value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));

  await Promise.all([
    recursiveDelete(db, db.collection('users').doc(uid), deletedRefs),
    recursiveDelete(db, db.collection('clients').doc(uid), deletedRefs),
    ...Array.from(new Set(knownCartDocIds)).map((cartId) => recursiveDelete(db, db.collection('cart').doc(cartId), deletedRefs).catch(() => {})),
    deleteQuery(db, db.collection('cart').where('accountDetails.uid', '==', uid), deletedRefs),
    deleteQuery(db, db.collectionGroup('profiles').where('uid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('jobs').where('ownerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collectionGroup('applications').where('bidderUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collectionGroup('applications').where('jobOwnerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('products').where('sellerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('productOrders').where('buyerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('productOrders').where('sellerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('productWishlists').where('buyerUid', '==', uid), deletedRefs),
    deleteQuery(db, db.collection('productWishlists').where('sellerUid', '==', uid), deletedRefs)
  ]);

  return Array.from(new Set(deletedRefs.filter(Boolean)));
}

module.exports = async function adminDeleteAccount(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    getFirebaseApp();
    const db = admin.firestore();
    const body = await readBody(request);
    const uid = String(body.uid || '').trim();
    const pin = String(body.adminPin || '').trim();

    if (!uid) {
      sendJson(response, 400, { error: 'User UID is required.' });
      return;
    }

    const actingAdmin = await assertAdminPin(db, pin);
    if (!actingAdmin) {
      sendJson(response, 403, { error: 'Admin authorization failed.' });
      return;
    }

    const userSnapshot = await db.collection('users').doc(uid).get();
    const userDoc = userSnapshot.exists ? userSnapshot.data() || {} : {};
    const subjectName = String(body.name || userDoc.name || userDoc.userPublicId || uid).trim();
    const now = Date.now();

    let authDeleted = true;
    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      if (error?.code !== 'auth/user-not-found') throw error;
      authDeleted = false;
    }

    const firestoreDeletedRefs = await deleteFirestoreAccountData(db, uid, userDoc);

    await db.collection(ADMIN_ACTIVITY_COLLECTION).add({
      type: 'admin_user_account_deleted',
      actorScope: 'admin',
      actorUid: actingAdmin.id,
      actorName: actingAdmin.name,
      actorEmail: actingAdmin.email,
      subjectUid: uid,
      subjectName,
      title: 'Account deleted',
      description: `${actingAdmin.name} permanently deleted ${subjectName} from Authentication and Firestore.`,
      sourceRef: `users/${uid}`,
      deletedFirestoreRefs: firestoreDeletedRefs.slice(0, 100),
      authDeleted,
      createdAtMs: now,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    sendJson(response, 200, {
      deleted: true,
      uid,
      authDeleted,
      firestoreDeletedCount: firestoreDeletedRefs.length
    });
  } catch (error) {
    sendJson(response, 500, { error: error?.message || 'Could not delete the account.' });
  }
};
