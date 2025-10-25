
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
    // The uploadFile function in storage-actions should handle progress reporting,
    // but we are passing onProgress for future flexibility if that changes.
    // For now, let's assume `uploadFile` doesn't report progress and we'll simulate it.
    
    // Simulate some progress for better UX
    onProgress(10);

    const testFileUrl = await uploadFile(file, filePath);
    
    onProgress(100); // Mark as complete

    const testsQuery = query(collection(db, 'traditionalTests'), where('postId', '==', postId), where('employerId', '==', employerId));
    const querySnapshot = await getDocs(testsQuery);

    let docId;

    if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { testFileUrl: testFileUrl, updatedAt: serverTimestamp() });
        docId = docRef.id;
    } else {
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
    throw error;
  }
}
