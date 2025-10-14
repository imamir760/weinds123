
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

  let candidateName = 'Unknown Candidate';
  let candidateEmail = 'No email provided';
  
  try {
      const candidateRef = doc(db, 'candidates', candidateId);
      // Ensure we await the result of getDoc
      const candidateSnap = await getDoc(candidateRef);
      if (candidateSnap.exists()) {
          candidateName = candidateSnap.data().fullName || candidateName;
          candidateEmail = candidateSnap.data().email || candidateEmail;
      }
  } catch (error) {
    console.error("Could not fetch candidate profile for application.", error);
    // Don't emit here, let the application creation fail and handle it there,
    // as applying without a profile is a failure condition.
    // This will now be caught by the outer try/catch.
    throw error;
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
  
  try {
    // Await the addDoc to properly catch errors on this operation
    await addDoc(applicationsCollectionRef, applicationData);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: '/applications',
      operation: 'create',
      requestResourceData: applicationData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the error so the caller knows the operation failed.
    throw serverError;
  }
}
