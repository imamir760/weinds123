// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { db, storage, auth as adminAuth } from '@/lib/firebase/admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse the form data from the request
async function parseFormData(req: Request) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string;
    const employerId = formData.get('employerId') as string;
    const fileName = formData.get('fileName') as string;
    
    // formidable expects a file path, so we need to write the file to a temporary location
    const tempDir = '/tmp';
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = `${tempDir}/${file.name}`;
    await fs.writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));

    return { 
        fields: { postId: [postId], employerId: [employerId], fileName: [fileName] },
        files: { file: [{ filepath: tempFilePath, mimetype: file.type }] }
    };
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
        // @ts-ignore
        form.parse(req, (err, fields, files) => {
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
