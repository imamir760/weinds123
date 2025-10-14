
'use client';

import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
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

  // Fetch employer's company name
  const employerRef = doc(db, 'employers', userId);
  let companyName = 'Unknown Company';
  try {
    const employerSnap = await getDoc(employerRef);
    if (employerSnap.exists()) {
      companyName = employerSnap.data().companyName || companyName;
    }
  } catch (error) {
     // If this fails, we can't proceed with a correct company name.
     // It's better to throw an error than to post incomplete data.
     console.error("Could not fetch employer profile to get company name.", error);
     const permissionError = new FirestorePermissionError({
        path: employerRef.path,
        operation: 'get',
     });
     errorEmitter.emit('permission-error', permissionError);
     throw permissionError;
  }

  const collectionName = postType === 'job' ? 'jobs' : 'internships';
  
  const postData = {
    ...jobDetails,
    employerId: userId,
    companyName: companyName, // Add denormalized company name
    createdAt: serverTimestamp(),
    pipeline: pipeline,
    applicantCount: 0,
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
    // Re-throw to allow for local error handling if needed
    throw permissionError;
  }
}
