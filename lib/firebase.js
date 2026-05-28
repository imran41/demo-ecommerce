import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if credentials are valid and not default/placeholder values
const isConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your-firebase-project-id' &&
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('placeholder')
);

// Check if Firebase Storage is specifically configured and not a placeholder
const isStorageConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET !== 'your-firebase-storage-bucket' &&
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.includes('placeholder')
);

export const isFirebaseConfigured = isConfigured;
export const isFirebaseStorageConfigured = isConfigured && isStorageConfigured;

let app;
export let db = null;
export let storage = null;
export let auth = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    
    if (isStorageConfigured) {
      storage = getStorage(app);
      // Set upload/operation retry limits to 5s (prevents infinite hanging spinner if storage bucket is not enabled)
      storage.maxUploadRetryTime = 5000;
      storage.maxOperationRetryTime = 5000;
    }
  } catch (error) {
    console.error('Firebase Client initialization failed:', error);
  }
}
