'use server';

import { storage } from '@/lib/firebase/admin';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param filePath The desired path in the storage bucket (e.g., 'skill-tests/my-file.pdf').
 * @returns The public download URL of the uploaded file.
 */
export async function uploadFile(file: File, filePath: string): Promise<string> {
    const bucket = storage.bucket(); // Uses the default bucket from your config

    // Convert the file to a buffer to be uploaded
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Get a reference to the file object in the bucket
    const fileRef = bucket.file(filePath);

    try {
        // Upload the file buffer
        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Make the file publicly readable and get the URL
        await fileRef.makePublic();
        const publicUrl = fileRef.publicUrl();

        console.log(`File uploaded successfully: ${publicUrl}`);
        return publicUrl;

    } catch (error) {
        console.error("Error uploading file to Firebase Storage:", error);
        throw new Error("File upload failed. Please check server permissions.");
    }
}
