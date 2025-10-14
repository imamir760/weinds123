
'use client';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { db } from '@/lib/firebase';

type PostType = 'job' | 'internship';

export function applyToAction(
  postType: PostType,
  postId: string,
  postTitle: string,
  companyName: string,
  candidateId: string
) {
  if (!candidateId) {
    console.error('User ID is missing. Cannot apply.');
    return;
  }
  
  // 1. Create application document in candidate's subcollection
  const applicationCollectionName = postType === 'job' ? 'jobApplications' : 'internshipApplications';
  const applicationData = {
    postId: postId,
    postTitle: postTitle,
    companyName: companyName,
    appliedOn: serverTimestamp(),
    status: 'Applied'
  };
  const applicationRef = doc(db, 'candidates', candidateId, applicationCollectionName, postId);
  
  setDoc(applicationRef, applicationData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: applicationRef.path,
      operation: 'create',
      requestResourceData: applicationData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });

  // 2. Create applicant document in post's subcollection
  const postCollectionName = postType === 'job' ? 'jobs' : 'internships';
  const applicantData = {
      candidateId: candidateId,
      appliedOn: serverTimestamp(),
      currentStage: 'Applied'
  };
  const applicantRef = doc(db, postCollectionName, postId, 'applicants', candidateId);

  setDoc(applicantRef, applicantData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: applicantRef.path,
      operation: 'create',
      requestResourceData: applicantData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
