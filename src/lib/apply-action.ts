
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
      const candidateSnap = await getDoc(candidateRef);
      if (candidateSnap.exists()) {
          candidateName = candidateSnap.data().fullName || candidateName;
          candidateEmail = candidateSnap.data().email || candidateEmail;
      }
  } catch (error) {
    console.error("Could not fetch candidate profile for application.", error);
    const permissionError = new FirestorePermissionError({
        path: `/candidates/${candidateId}`,
        operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    // Do not proceed if we can't get the candidate's profile
    return;
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
    await addDoc(applicationsCollectionRef, applicationData);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: '/applications',
      operation: 'create',
      requestResourceData: applicationData,
    });
    errorEmitter.emit('permission-error', permissionError);
  }
}
