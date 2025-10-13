'use client';

import { collection, doc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
  const postCollectionRef = collection(db, collectionName);

  const postData = {
    ...jobDetails,
    employerId: userId,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(postCollectionRef, postData);
    
    // Create pipeline subcollection
    const batch = writeBatch(db);
    const pipelineColRef = collection(db, collectionName, docRef.id, 'pipeline');
    
    pipeline.forEach(stageConfig => {
        const stageDocRef = doc(pipelineColRef, stageConfig.stage);
        batch.set(stageDocRef, { type: stageConfig.type || null, order: pipeline.indexOf(stageConfig) });
    });

    await batch.commit();
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
