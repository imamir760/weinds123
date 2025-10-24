
'use client';

import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

/**
 * Uploads a file to Firebase Storage with progress tracking and a timeout.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket.
 * @param onProgress A callback to report upload progress (0-100).
 * @returns The public download URL of the uploaded file.
 */
export function uploadFileWithProgress(
    file: File, 
    filePath: string,
    onProgress: (percentage: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        let progressTimeout: NodeJS.Timeout | null = null;
        let hasMadeProgress = false;

        const startTimeout = () => {
            progressTimeout = setTimeout(() => {
                if (!hasMadeProgress) {
                    uploadTask.cancel();
                    reject(new Error("Upload timed out. The upload did not start making progress within 10 seconds. Please check your network connection and Firebase Storage rules."));
                }
            }, 10000); // 10-second timeout
        };

        const clearTimeoutIfSet = () => {
            if (progressTimeout) {
                clearTimeout(progressTimeout);
                progressTimeout = null;
            }
        };

        startTimeout(); // Start the initial timeout

        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // If we get here, some progress has been made (even if it's 0%)
                if (!hasMadeProgress) {
                    hasMadeProgress = true;
                    clearTimeoutIfSet(); // Clear initial timeout once the process starts
                }
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                clearTimeoutIfSet(); // Clear timeout on error
                console.error("Firebase Storage Upload Error:", error);
                
                if (error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found' || error.code === 'storage/unknown') {
                     const permissionError = new FirestorePermissionError({
                        path: filePath,
                        operation: 'write',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    reject(permissionError);
                } else {
                    reject(new Error("File upload failed. Please check your network and storage rules."));
                }
            },
            async () => {
                clearTimeoutIfSet(); // Clear timeout on success
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    console.error("Failed to get download URL", error);
                    reject(error);
                }
            }
        );
    });
}
