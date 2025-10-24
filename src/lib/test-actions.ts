
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

  const formData = new FormData();
  formData.append('file', file);
  formData.append('postId', postId);
  formData.append('employerId', employerId);
  formData.append('fileName', file.name);

  // Get the Firebase ID token for the current user.
  const idToken = await user.getIdToken();

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
        throw new Error(errorResponse.error || `Upload failed with status: ${response.status}`);
    }

    return await response.json();

  } catch (error: any) {
    console.error('File upload error:', error);
    throw error;
  }
}
