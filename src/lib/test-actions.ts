
'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { uploadFile } from './storage-actions';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Handles the complete process of uploading a traditional test.
 * 1. Uploads the file to Firebase Storage.
 * 2. Creates a corresponding document in the 'traditionalTests' collection.
 * @param postId The ID of the job/internship post.
 * @param employerId The ID of the employer.
 * @param file The test file to upload.
 */
export async function uploadTraditionalTest(postId: string, employerId: string, file: File) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!postId || !employerId) {
    throw new Error('Post ID or Employer ID is missing.');
  }
  
  try {
    // 1. Upload file to Storage
    const filePath = `skill-tests/${postId}/${employerId}/${file.name}`;
    const testFileUrl = await uploadFile(file, filePath);

    // 2. Create document in Firestore
    const testData = {
      postId,
      employerId,
      testFileUrl,
      createdAt: serverTimestamp(),
    };

    const collectionRef = collection(db, 'traditionalTests');
    
    // Using .catch() for permission error handling
    await addDoc(collectionRef, testData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: '/traditionalTests',
            operation: 'create',
            requestResourceData: testData,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw to be caught by the outer try/catch
        throw serverError;
    });

  } catch (error) {
    console.error('Failed to upload traditional test:', error);
    // Re-throw the error so the UI component can handle it (e.g., show a toast)
    throw error;
  }
}
