
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
 * @param onProgress Callback to report upload progress.
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
    throw new Error('No authenticated user found. Please log in again.');
  }

  let idToken;
  try {
    // Force refresh the token to ensure it's not expired and valid
    idToken = await user.getIdToken(true);
  } catch (error) {
    console.error("Error getting authentication token:", error);
    throw new Error("Could not authenticate your session. Please try logging in again.");
  }


  const formData = new FormData();
  formData.append('file', file);
  formData.append('postId', postId);
  formData.append('employerId', employerId);
  formData.append('fileName', file.name);

  try {
    onProgress(10); 

    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
    });
    
    onProgress(100);

    if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({ error: 'An unknown error occurred during upload.' }));
        
        if (response.status === 403 || response.status === 401) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: '/traditionalTests or /storage',
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
