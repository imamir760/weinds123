
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
  let companyName = 'Company Name N/A'; // Default value
  try {
    const employerSnap = await getDoc(employerRef);
    if (employerSnap.exists()) {
      companyName = employerSnap.data().companyName || companyName;
    } else {
        console.warn(`Employer profile not found for uid: ${userId}. Using default company name.`);
    }
  } catch (error) {
     console.error("Could not fetch employer profile to get company name.", error);
     const permissionError = new FirestorePermissionError({
        path: employerRef.path,
        operation: 'get',
     });
     errorEmitter.emit('permission-error', permissionError);
     // We can proceed with the default company name but applying will be disabled.
  }

  const collectionName = postType === 'job' ? 'jobs' : 'internships';
  
  const postData = {
    ...jobDetails,
    employerId: userId,
    companyName: companyName, // Add denormalized company name
    createdAt: serverTimestamp(),
    pipeline: pipeline,
    applicantCount: 0,
    status: 'Active'
  };

  const collectionRef = collection(db, collectionName);
  
  // Post the job/internship, but catch permission errors
  addDoc(collectionRef, postData).catch(serverError => {
    const permissionError = new FirestorePermissionError({
        path: `/${collectionName}`,
        operation: 'create',
        requestResourceData: postData,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
