
'use client';

import { auth, db } from './firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { uploadFile } from './storage-actions';
import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';

/**
 * Handles the complete process of uploading a traditional test.
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
    throw new FirestorePermissionError({
        path: `/tradTest/${employerId}`,
        operation: 'create',
    });
  }

  // Use a structured path: /tradTest/EMPLOYER_ID/POST_ID/FILENAME
  const filePath = `tradTest/${employerId}/${postId}/${file.name}`;

  try {
    // 1. Upload the file and get its URL, with progress reporting
    // The uploadFile function from storage-actions will handle progress.
    const testFileUrl = await uploadFile(file, filePath);
    onProgress(100); // Mark as complete

    // 2. Check if a test document for this post already exists
    const testsQuery = query(collection(db, 'traditionalTests'), where('postId', '==', postId), where('employerId', '==', employerId));
    const querySnapshot = await getDocs(testsQuery);

    let docId;

    if (!querySnapshot.empty) {
        // Update existing document
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { testFileUrl: testFileUrl, updatedAt: serverTimestamp() });
        docId = docRef.id;
    } else {
        // Create new document
        const testData = {
          postId,
          employerId,
          testFileUrl,
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'traditionalTests'), testData);
        docId = docRef.id;
    }

    return { id: docId, testFileUrl };

  } catch (error: any) {
    console.error('Traditional Test upload process failed:', error);
    // Re-throw the original error so the UI can catch its specific type
    throw error;
  }
}
