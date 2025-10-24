
'use client';

import { auth } from './firebase';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Handles the complete process of uploading a traditional test.
 * This function now sends the file to a server-side API route for processing.
 * @param postId The ID of the job/internship post.
 * @param employerId The ID of the employer.
 * @param file The test file to upload.
 * @param onProgress Callback to report upload progress (note: fetch does not support progress).
 */
export async function uploadTraditionalTest(
  postId: string,
  employerId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<{ id: string; testFileUrl: string }> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!postId || !employerId) {
    throw new Error('Post ID or Employer ID is missing.');
  }
  
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found.');
  }

  let idToken;
  try {
    idToken = await user.getIdToken(true); // Force refresh the token
  } catch (error) {
    console.error("Error getting authentication token:", error);
    throw new Error("Could not authenticate user. Please try logging in again.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('postId', postId);
  formData.append('employerId', employerId);
  formData.append('fileName', file.name);

  try {
    onProgress(50); // Simulate progress since fetch doesn't support it
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
    });

    onProgress(100);

    if (!response.ok) {
        const errorResponse = await response.json();
        if (response.status === 403 || response.status === 401) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: '/traditionalTests',
                operation: 'create',
            }));
        }
        // Use the specific error from the server if available
        throw new Error(errorResponse.error || `Upload failed with status: ${response.status}`);
    }

    return await response.json();

  } catch (error: any) {
    console.error('File upload error:', error);
    // Re-throw the error so the UI component can catch it and display a toast
    throw error;
  }
}
