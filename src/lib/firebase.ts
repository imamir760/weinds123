// src/lib/firebase.ts
'use client'; 

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import type { FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Helper to parse FIREBASE_WEBAPP_CONFIG if present (hosting sets this as JSON)
function getConfigFromEnv(): Partial<FirebaseOptions> {
  try {
    if (process.env.FIREBASE_WEBAPP_CONFIG) {
      const parsed = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      // Map parsed keys to FirebaseOptions shape
      return {
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket,
        messagingSenderId: parsed.messagingSenderId,
        appId: parsed.appId,
        measurementId: parsed.measurementId,
      };
    }
  } catch (e) {
    // ignore parse errors; we'll fallback to NEXT_PUBLIC_*
    // You can log if you want: console.warn('Invalid FIREBASE_WEBAPP_CONFIG', e)
  }

  // Fallback to NEXT_PUBLIC_* env vars (typical Next pattern)
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

let _app: FirebaseApp | null = null;
let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;
let _storage: ReturnType<typeof getStorage> | null = null;

// Initialize only in the browser (avoid server-side init during prerender)
function initialize() {
  if (typeof window === 'undefined') {
    // Running on server — do not initialize client SDK here
    return;
  }
  
  // Only run this once
  if (_app) return;

  const envConfig = getConfigFromEnv();

  // Basic validation — if no apiKey, don't initialize to avoid exceptions during build
  if (!envConfig.apiKey) {
    // In dev you might want: console.warn('[firebase] missing apiKey; firebase not initialized');
    return;
  }

  const firebaseConfig = envConfig as FirebaseOptions;

  try {
    _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _storage = getStorage(_app);
  } catch (err) {
    // If initialization fails, return null instead of throwing
    console.error('Firebase init error:', err);
  }
}

// Call initialize on module load.
initialize();

// Make the initialized instances available.
// They will be null on the server.
export const app = _app;
export const auth = _auth;
export const db = _db;
export const storage = _storage;
