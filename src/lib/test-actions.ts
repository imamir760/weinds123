
'use client';

import { auth, db } from './firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { uploadFileWithProgress } from './storage-actions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Handles the complete process of uploading a traditional test with progress.
 * @param postId The ID of the job/internship post.
 * @param employerId The ID of the employer.
 * @param file The test file to upload.
 * @param onProgress A callback to report upload progress (0-100).
 */
export async function uploadTraditionalTest(
  postId: string,
  employerId: string,
  file: File,
  onProgress: (percentage: number) => void
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

  const filePath = `traditional-tests/${employerId}/${postId}/${file.name}`;

  try {
    const testFileUrl = await uploadFileWithProgress(file, filePath, onProgress);

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
    
    if (error.name === 'FirebaseError' && error.code?.includes('permission-denied')) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: '/traditionalTests',
            operation: 'create',
        }));
    }
    
    throw error;
  }
}
