
'use client';

import { auth, db } from './firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { uploadFile } from './storage-actions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Handles the complete process of uploading a traditional test.
 * This function now uploads the file directly to Firebase Storage from the client
 * and then creates a corresponding document in Firestore.
 * @param postId The ID of the job/internship post.
 * @param employerId The ID of the employer.
 * @param file The test file to upload.
 * @param onProgress Callback to report upload progress (will be implemented if needed).
 */
export async function uploadTraditionalTest(
  postId: string,
  employerId: string,
  file: File,
  onProgress: (progress: number) => void // Kept for future use, but not implemented in this simplified version
): Promise<{ id: string; testFileUrl: string }> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!postId || !employerId) {
    throw new Error('Post ID or Employer ID is missing.');
  }
  
  const user = auth.currentUser;
  if (!user || user.uid !== employerId) {
    throw new Error('You are not authorized to perform this action.');
  }

  // Define the path for the file in Firebase Storage
  const filePath = `traditional-tests/${employerId}/${postId}/${file.name}`;

  try {
    // Step 1: Upload the file directly to Firebase Storage
    const testFileUrl = await uploadFile(file, filePath);

    // Step 2: If upload is successful, create a document in Firestore
    const testData = {
      postId,
      employerId,
      testFileUrl,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'traditionalTests'), testData);

    return { id: docRef.id, testFileUrl };

  } catch (error: any) {
    console.error('Traditional Test upload process failed:', error);
    
    // Check if the error is a Firestore permission error during doc creation
    if (error.name === 'FirebaseError' && error.code?.includes('permission-denied')) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: '/traditionalTests',
            operation: 'create',
        }));
    }
    
    // Re-throw the original error from storage or firestore to be displayed
    throw error;
  }
}
