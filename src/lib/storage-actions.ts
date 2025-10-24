
'use client';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads a file to Firebase Storage using the client-side SDK.
 * This is a simplified and robust method that uploads directly.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket (e.g., 'traditional-tests/my-file.pdf').
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
    try {
        const storageRef = ref(storage, filePath);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;

    } catch (error: any) {
        console.error("Firebase Storage Upload Error:", error);

        // Check for specific storage permission errors
        if (error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found') {
             throw new Error("Permission denied. You might not have access to this storage location. Please check your Storage Rules in Firebase.");
        }
        
        throw new Error("File upload failed. Please check your network connection and try again.");
    }
}
