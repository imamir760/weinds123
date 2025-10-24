
'use client';

import { getDownloadURL, ref, uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { FirestorePermissionError } from './errors';

/**
 * Uploads a file to Firebase Storage with progress tracking.
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

        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Firebase Storage Upload Error:", error);
                if (error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found' || error.code === 'storage/unknown') {
                     reject(new FirestorePermissionError({
                        path: filePath,
                        operation: 'write',
                    }));
                } else {
                    reject(new Error("File upload failed. Please check your network connection and try again."));
                }
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Uploads a file without progress tracking.
 * @param file The file to upload.
 * @param filePath The path in the storage bucket.
 * @returns The download URL.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(storageRef);
}
