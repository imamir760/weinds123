'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { db } from '@/lib/firebase';

export type PostType = 'job' | 'internship';

export async function createJobWithPipeline(
  postType: PostType,
  jobDetails: any,
  pipeline: { stage: string, type?: string }[],
  userId: string
) {
  if (!userId) {
    throw new Error('User ID is missing. Cannot create post.');
  }

  const collectionName = postType === 'job' ? 'jobs' : 'internships';
  
  const postData = {
    ...jobDetails,
    employerId: userId,
    createdAt: serverTimestamp(),
    pipeline: pipeline,
    applicantCount: 0, // Initialize applicant count
  };

  const collectionRef = collection(db, collectionName);
  
  try {
    await addDoc(collectionRef, postData);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: `/${collectionName}`,
        operation: 'create',
        requestResourceData: postData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw to allow for local error handling if needed, though the listener will catch it
    throw permissionError;
  }
}
