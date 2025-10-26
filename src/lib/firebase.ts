
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyA_KRERSfY510iFEVBSu0HGtqOY5pzkF1c",
  authDomain: "studio-2514331212-b0f7f.firebaseapp.com",
  projectId: "studio-2514331212-b0f7f",
  storageBucket: "studio-2514331212-b0f7f.appspot.com",
  messagingSenderId: "877736539149",
  appId: "1:877736539149:web:1fc0d5406a63615b7ad144",
  measurementId: "G-D2EM9K3R4W"
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error('Firebase initialization error', e);
  }
}

export { app, auth, db, storage };
