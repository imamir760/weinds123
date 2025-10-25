
'use client';

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    try {
        await uploadBytesResumable(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error: any) {
        console.error("Firebase Storage Upload Error:", error);
        
        // Create a specific permission error to be thrown
        const permissionError = new FirestorePermissionError({
            path: filePath,
            operation: 'write',
        });
        
        // Emit the error for global listeners (like the dev overlay)
        errorEmitter.emit('permission-error', permissionError);

        // Also throw it so the calling function's try/catch can handle it
        throw permissionError;
    }
}
