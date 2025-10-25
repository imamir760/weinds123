
'use client';

import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

/**
 * Uploads a file to Firebase Storage with progress tracking.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket.
 * @param onProgress A callback to report upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFile(
    file: File, 
    filePath: string,
    onProgress: (percentage: number) => void
): Promise<string> {
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // Report progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Firebase Storage Upload Error:", error.code, error.message);
                
                let permissionError: FirestorePermissionError;
                
                // Create a specific permission error to be thrown
                if (error.code === 'storage/unauthorized') {
                     permissionError = new FirestorePermissionError({
                        path: filePath,
                        operation: 'write',
                    });
                } else {
                    // For other storage errors, create a generic error
                    permissionError = new FirestorePermissionError({
                        path: filePath,
                        operation: 'write',
                    });
                    permissionError.message = `Storage Error: ${error.message}`;
                }
                
                // Emit the error for global listeners (like the dev overlay)
                errorEmitter.emit('permission-error', permissionError);
                
                // Reject the promise so the calling function's try/catch can handle it
                reject(permissionError);
            },
            async () => {
                // Handle successful uploads on complete
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (urlError) {
                    console.error("Failed to get download URL", urlError);
                    reject(urlError);
                }
            }
        );
    });
}
