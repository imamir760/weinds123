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
    pipeline: pipeline, // Embed the pipeline configuration directly
  };

  try {
    const docRef = await addDoc(collection(db, collectionName), postData);
    return docRef.id;

  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: `/${collectionName}`,
      operation: 'create',
      requestResourceData: postData,
    });

    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to be caught by the caller
    throw serverError;
  }
}
