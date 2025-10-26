
import admin from 'firebase-admin';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_KRERSfY510iFEVBSu0HGtqOY5pzkF1c",
  authDomain: "studio-2514331212-b0f7f.firebaseapp.com",
  projectId: "studio-2514331212-b0f7f",
  storageBucket: "studio-2514331212-b0f7f.appspot.com",
  messagingSenderId: "877736539149",
  appId: "1:877736539149:web:1fc0d5406a63615b7ad144"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: firebaseConfig.storageBucket,
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}


const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage, admin };
