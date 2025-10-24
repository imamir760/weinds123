
'use client';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
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

  const formData = new FormData();
  formData.append('file', file);
  formData.append('postId', postId);
  formData.append('employerId', employerId);
  formData.append('fileName', file.name);


  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const errorResponse = JSON.parse(xhr.responseText);
        // This could be a permission error from our API route
        if(errorResponse.error?.includes('permission')) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: '/traditionalTests',
                operation: 'create',
            }));
        }
        reject(new Error(errorResponse.error || 'Upload failed'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload.'));
    };

    xhr.send(formData);
  });
}
