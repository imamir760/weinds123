
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
  let candidateHeadline = 'No headline';
  let candidateSkills: string[] = [];
  
  try {
      const candidateRef = doc(db, 'candidates', candidateId);
      const candidateSnap = await getDoc(candidateRef);
      if (candidateSnap.exists()) {
          const data = candidateSnap.data();
          candidateName = data.fullName || candidateName;
          candidateEmail = data.email || candidateEmail;
          candidateHeadline = data.headline || candidateHeadline;
          candidateSkills = Array.isArray(data.skills) ? data.skills : [];
      } else {
        console.warn(`Candidate profile not found for id: ${candidateId}`);
      }
  } catch (error) {
    console.error("Could not fetch candidate profile for application.", error);
    const permissionError = new FirestorePermissionError({
      path: `/candidates/${candidateId}`,
      operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the error so the UI can know the application failed
    throw error;
  }
  
  const applicationData = {
    postId: postId,
    postType: postType,
    candidateId: candidateId,
    employerId: employerId,
    postTitle: postTitle,
    companyName: companyName,
    appliedOn: serverTimestamp(),
    status: 'Applied',
    // Denormalized data
    candidateName: candidateName,
    candidateEmail: candidateEmail,
    candidateHeadline: candidateHeadline,
    candidateSkills: candidateSkills,
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
    // Re-throw the error so the caller knows the operation failed.
    throw serverError;
  }
}
