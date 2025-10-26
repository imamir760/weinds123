
import admin from 'firebase-admin';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_KRERSfY510iFEVBSu0HGtqOY5pzkF1c",
  authDomain: "studio-2514331212-b0f7f.firebaseapp.com",
  projectId: "studio-2514331212-b0f7f",
  storageBucket: "studio-2514331212-b0f7f.appspot.com",
  messagingSenderId: "877736539149",
  appId: "1:877736539149:web:5c95543d9235df5b7ad144",
  measurementId: "G-5G3J9CK5G9"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: firebaseConfig.storageBucket,
  });
}


const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage, admin };
