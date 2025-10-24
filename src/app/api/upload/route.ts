
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { db, storage, auth as adminAuth } from '@/lib/firebase/admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
        console.error("Error verifying token:", error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const postId = formData.get('postId') as string | null;
    const employerId = formData.get('employerId') as string | null;
    const fileName = formData.get('fileName') as string | null;

    if (!file || !postId || !employerId || !fileName) {
        return NextResponse.json({ error: 'Missing required form fields.' }, { status: 400 });
    }
    
    // Security check: ensure the user uploading is the employerId from the form
    if (decodedToken.uid !== employerId) {
       return NextResponse.json({ error: 'Forbidden: You do not have permission to upload for this employer.' }, { status: 403 });
    }

    const filePath = `traditional-tests/${employerId}/${postId}/${fileName}`;
    const bucket = storage.bucket();

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileUpload = bucket.file(filePath);

    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
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
