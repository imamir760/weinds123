
'use client';

import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
  
  const batch = writeBatch(db);

  // 1. Create application document in candidate's subcollection
  const applicationCollectionName = postType === 'job' ? 'jobApplications' : 'internshipApplications';
  const applicationRef = doc(db, 'candidates', candidateId, applicationCollectionName, postId);
  batch.set(applicationRef, {
      postId: postId,
      postTitle: postTitle,
      companyName: companyName,
      appliedOn: serverTimestamp(),
      status: 'Applied'
  });

  // 2. Create applicant document in post's subcollection
  const postCollectionName = postType === 'job' ? 'jobs' : 'internships';
  const applicantRef = doc(db, postCollectionName, postId, 'applicants', candidateId);
  batch.set(applicantRef, {
      candidateId: candidateId,
      appliedOn: serverTimestamp(),
      currentStage: 'Applied'
  });

  // Commit the batch
  batch.commit().catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: `/${applicationCollectionName} or /${postCollectionName}/${postId}/applicants`,
      operation: 'write',
      requestResourceData: { postId, candidateId },
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
