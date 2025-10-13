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
  
  const postData = {
    ...jobDetails,
    employerId: userId,
    createdAt: serverTimestamp(),
  };

  try {
    const batch = writeBatch(db);

    // 1. Create the main job/internship document
    const postDocRef = doc(collection(db, collectionName));
    batch.set(postDocRef, postData);
    
    // 2. Create the pipeline subcollection documents
    const pipelineColRef = collection(db, collectionName, postDocRef.id, 'pipeline');
    
    pipeline.forEach((stageConfig, index) => {
        const stageDocRef = doc(pipelineColRef, stageConfig.stage);
        batch.set(stageDocRef, { 
            type: stageConfig.type || null, 
            order: index 
        });
    });

    // 3. Commit the batch
    await batch.commit();
    return postDocRef.id;

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
