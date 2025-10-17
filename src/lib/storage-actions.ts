'use client';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
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
        throw new Error("File upload failed. Please check your storage rules and network connection.");
    }
}
