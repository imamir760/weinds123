'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { db } from '@/lib/firebase';

type ProfileCollection = 'candidates' | 'employers' | 'institutes';

export function saveUserProfile(
  collection: ProfileCollection,
  userId: string,
  data: any
) {
  if (!userId) {
    console.error('User ID is missing. Cannot save profile.');
    return;
  }
  const docRef = doc(db, collection, userId);

  // No await here. Chain the .catch() block.
  setDoc(docRef, data, { merge: true }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update', // or 'create'
      requestResourceData: data,
    });

    // Emit the error with the global error emitter
    errorEmitter.emit('permission-error', permissionError);
  });
}
