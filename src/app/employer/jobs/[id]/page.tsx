
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData, query, where } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Star, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type PostDetails = DocumentData & {
  id: string;
  title: string;
  type: 'job' | 'internship';
  employerId?: string;
};

type Applicant = DocumentData & {
  id: string; // This is the candidate's UID
  candidateId: string;
  status: string;
  fullName?: string;
  headline?: string;
  avatar?: string;
  matchScore?: number;
};

export default function ViewApplicantsPage({ params }: { params: { id: string } }) {
  const postId = params.id;
  
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const fetchPostAndApplicants = useCallback(async (currentUser: FirebaseUser) => {
    setLoading(true);

    try {
        let postSnap;
        let postType: 'job' | 'internship' | null = null;
        const jobRef = doc(db, 'jobs', postId);
        postSnap = await getDoc(jobRef);
        if (postSnap.exists()) {
            postType = 'job';
        } else {
            const internshipRef = doc(db, 'internships', postId);
            postSnap = await getDoc(internshipRef);
            if (postSnap.exists()) postType = 'internship';
        }

        if (!postSnap.exists() || !postType) {
            setPostDetails(null);
            setIsOwner(false);
            setLoading(false);
            return;
        }

        const postData = { id: postSnap.id, ...postSnap.data(), type: postType } as PostDetails;
        setPostDetails(postData);

        const owner = currentUser.uid === postData.employerId;
        setIsOwner(owner);
        if (!owner) {
            setLoading(false);
            return;
        }

        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('postId', '==', postId), where('employerId', '==', currentUser.uid));
        const applicationsSnap = await getDocs(q).catch(serverError => {
             const permissionError = new FirestorePermissionError({ path: 'applications', operation: 'list', requestResourceData: {postId, employerId: currentUser.uid} });
             errorEmitter.emit('permission-error', permissionError);
             throw permissionError;
        });

        const applicationsData = applicationsSnap.docs.map(doc => doc.data());
        
        if (applicationsData.length === 0) {
            setApplicants([]);
            setLoading(false);
            return;
        }
        
        const candidateIds = applicationsData.map(app => app.candidateId).filter(Boolean);
        if (candidateIds.length === 0) {
             setApplicants([]);
             setLoading(false);
             return;
        }
        
        const candidatePromises = candidateIds.map(id => getDoc(doc(db, 'candidates', id)).catch(serverError => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `/candidates/${id}`, operation: 'get' }));
            return null;
        }));

        const candidateSnaps = await Promise.all(candidatePromises);

        const mergedApplicants = candidateSnaps.map((snap, index) => {
            const profile = snap?.exists() ? snap.data() : {};
            const appData = applicationsData.find(app => app.candidateId === snap?.id);
            return {
                id: snap?.id || candidateIds[index],
                candidateId: snap?.id || candidateIds[index],
                fullName: profile.fullName || 'Unknown Candidate',
                headline: profile.headline || 'No headline',
                avatar: profile.fullName?.charAt(0) || 'U',
                status: appData?.status || 'Applied',
                matchScore: Math.floor(Math.random() * (98 - 75 + 1) + 75), // Placeholder
            } as Applicant;
        });
        
        setApplicants(mergedApplicants);

    } catch (error) {
        console.error("An error occurred during data fetching:", error);
    } finally {
        setLoading(false);
    }
  }, [postId]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPostAndApplicants(currentUser);
      } else {
        setIsOwner(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchPostAndApplicants]);

  const PageContent = (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Postings</Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{postDetails?.title || 'Loading...'}</h1>
                <p className="text-sm text-muted-foreground">Applicants</p>
            </div>
        </div>

        {loading ? (
            <Card>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        ) : isOwner === false ? (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="font-semibold text-lg text-destructive">Access Denied</p>
                    <p className="text-muted-foreground mt-2">You do not have permission to view the applicants for this post.</p>
                </CardContent>
            </Card>
        ) : !applicants || applicants.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No applicants for this post yet.</p>
                </CardContent>
             </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applicants.map(applicant => (
                    <Card key={applicant.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="w-12 h-12">
                                <AvatarFallback>{applicant.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{applicant.fullName}</CardTitle>
                                <CardDescription>{applicant.headline}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-5 h-5"/>
                                <span className="font-bold">{applicant.matchScore}% Match</span>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/employer/jobs/${postId}/candidates/${applicant.candidateId}`}>View Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
