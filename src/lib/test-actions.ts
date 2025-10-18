
'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { uploadFileWithProgress } from './storage-actions';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Handles the complete process of uploading a traditional test.
 * 1. Uploads the file to Firebase Storage under the 'traditional-tests' folder.
 * 2. Creates a corresponding document in the 'traditionalTests' collection.
 * @param postId The ID of the job/internship post.
 * @param employerId The ID of the employer.
 * @param file The test file to upload.
 * @param onProgress Callback to report upload progress.
 */
export async function uploadTraditionalTest(
  postId: string,
  employerId: string,
  file: File,
  onProgress: (progress: number) => void
) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!postId || !employerId) {
    throw new Error('Post ID or Employer ID is missing.');
  }
  
  try {
    // 1. Upload file to Storage in the specified folder with progress
    const filePath = `traditional-tests/${employerId}/${postId}/${file.name}`;
    const testFileUrl = await uploadFileWithProgress(file, filePath, onProgress);

    // 2. Create document in Firestore
    const testData = {
      postId,
      employerId,
      testFileUrl,
      createdAt: serverTimestamp(),
    };

    const collectionRef = collection(db, 'traditionalTests');
    
    // Using .catch() for permission error handling
    const docRef = await addDoc(collectionRef, testData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: '/traditionalTests',
            operation: 'create',
            requestResourceData: testData,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw to be caught by the outer try/catch
        throw serverError;
    });

    return { id: docRef.id, ...testData };

  } catch (error) {
    console.error('Failed to upload traditional test:', error);
    // Re-throw the error so the UI component can handle it (e.g., show a toast)
    throw error;
  }
}
