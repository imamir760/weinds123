// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { db, storage, auth as adminAuth } from '@/lib/firebase/admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

import type { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get the raw body
async function getRawBody(req: Request) {
    const reader = req.body?.getReader();
    if (!reader) {
        throw new Error('Could not read request body');
    }
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return Buffer.concat(chunks);
}


export async function POST(req: Request) {
  try {
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    
    // Use formidable to parse the multipart form data
    const data: { fields: any; files: any } = await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req as unknown as NextApiRequest, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

    const file = data.files.file[0];
    const postId = data.fields.postId[0];
    const employerId = data.fields.employerId[0];
    const fileName = data.fields.fileName[0];
    
    // Security check: ensure the user uploading is the employerId from the form
    if (decodedToken.uid !== employerId) {
       return NextResponse.json({ error: 'Forbidden: You do not have permission to upload for this employer.' }, { status: 403 });
    }

    const filePath = `traditional-tests/${employerId}/${postId}/${fileName}`;
    const bucket = storage.bucket();
    const fileBuffer = await fs.readFile(file.filepath);

    const fileUpload = bucket.file(filePath);

    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    const testFileUrl = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future expiration
    }).then(urls => urls[0]);


    // Create document in Firestore
    const testData = {
      postId,
      employerId,
      testFileUrl,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'traditionalTests'), testData);

    return NextResponse.json({ id: docRef.id, testFileUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
