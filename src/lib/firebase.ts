
'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_KRERSfY510iFEVBSu0HGtqOY5pzkF1c",
  authDomain: "studio-2514331212-b0f7f.firebaseapp.com",
  projectId: "studio-2514331212-b0f7f",
  storageBucket: "studio-2514331212-b0f7f.appspot.com",
  messagingSenderId: "877736539149",
  appId: "1:877736539149:web:1fc0d5406a63615b7ad144"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
