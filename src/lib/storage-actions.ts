'use client';

import { getDownloadURL, ref, uploadBytes, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads a file to Firebase Storage using the client-side SDK.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket (e.g., 'skill-tests/my-file.pdf').
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
    try {
        const storageRef = ref(storage, filePath);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log(`File uploaded successfully: ${downloadURL}`);
        return downloadURL;

    } catch (error) {
        console.error("Error uploading file to Firebase Storage:", error);
        // This will be caught by the calling function's try/catch block
        throw new Error("File upload failed. Please check your storage rules and network connection.");
    }
}


/**
 * Uploads a file to Firebase Storage with progress tracking.
 * @param file The file to upload.
 * @param filePath The path in the storage bucket.
 * @param onProgress A callback function that receives the upload progress percentage.
 * @returns A promise that resolves with the download URL.
 */
export function uploadFileWithProgress(
  file: File,
  filePath: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(new Error('File upload failed. Please check your storage rules and network connection.'));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(new Error('Could not get download URL.'));
        }
      }
    );
  });
}
