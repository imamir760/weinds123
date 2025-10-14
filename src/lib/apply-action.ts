
'use client';

import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { db } from '@/lib/firebase';

type PostType = 'job' | 'internship';

export function applyToAction(
  postType: PostType,
  postId: string,
  employerId: string,
  postTitle: string,
  companyName: string,
  candidateId: string
) {
  if (!candidateId || !employerId) {
    console.error('User or Employer ID is missing. Cannot apply.');
    return;
  }
  
  const applicationData = {
    postId: postId,
    postType: postType,
    candidateId: candidateId,
    employerId: employerId,
    postTitle: postTitle,
    companyName: companyName,
    appliedOn: serverTimestamp(),
    status: 'Applied'
  };
  
  const applicationsCollectionRef = collection(db, 'applications');
  
  addDoc(applicationsCollectionRef, applicationData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: '/applications',
      operation: 'create',
      requestResourceData: applicationData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
