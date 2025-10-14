
'use client';

import { doc, serverTimestamp, collection, addDoc, getDoc } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { db } from '@/lib/firebase';

type PostType = 'job' | 'internship';

export async function applyToAction(
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

  let candidateName = 'Unknown';
  let candidateEmail = 'N/A';
  
  try {
      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateSnap = await getDoc(candidateRef);
      if (candidateSnap.exists()) {
          candidateName = candidateSnap.data().fullName || 'Unknown Candidate';
          candidateEmail = candidateSnap.data().email || 'No email';
      }
  } catch (error) {
    console.error("Could not fetch candidate profile for application.", error);
    // Don't emit a fatal error, but we could log this for debugging.
    // The application can proceed with default values.
  }
  
  const applicationData = {
    postId: postId,
    postType: postType,
    candidateId: candidateId,
    candidateName: candidateName,
    candidateEmail: candidateEmail,
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
