
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData, query, where } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Star, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type Stage = {
  stage: string;
  type?: string;
};

type PostDetails = DocumentData & {
  id: string;
  title: string;
  pipeline: Stage[];
  type: 'job' | 'internship';
  employerId?: string;
};

type Applicant = DocumentData & {
  id: string; 
  candidateId: string;
  status: string;
  fullName?: string;
  headline?: string;
  avatar?: string;
  matchScore?: number;
};

const getStageName = (stage: Stage): string => {
    if (!stage || !stage.stage) return '';
    const stageName = stage.stage.replace(/_/g, ' ');
    if (stage.type) {
      const typeName = stage.type.replace(/_/g, ' ');
      return `${stageName} (${typeName})`;
    }
    return stageName;
};

const CandidateStageDialog = ({ isOpen, onOpenChange, stageName, candidates, postId, postType }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    stageName: string;
    candidates: Applicant[];
    postId: string;
    postType: 'job' | 'internship';
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Candidates in "{stageName}"</DialogTitle>
                    <DialogDescription>{candidates.length} candidate(s) in this stage.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                    {candidates.length > 0 ? (
                        candidates.map(candidate => (
                            <Card key={`${postId}-${candidate.id}`} className="bg-background/50 shadow-md hover:shadow-lg transition-shadow">
                               <CardContent className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3 group">
                                        <Avatar className="w-11 h-11 border-2 border-primary/20">
                                            <AvatarFallback>{candidate.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-base">{candidate.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{candidate.headline}</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/employer/${postType}s/${postId}/candidates/${candidate.id}`}>View Profile</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <p>No candidates in this stage.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
};


export default function JobPipelinePage({ params }: { params: { id: string } }) {
  const postId = params.id;
  
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{ stageName: string; candidates: Applicant[] } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  const fetchPostAndApplicants = useCallback(async (user: FirebaseUser) => {
    setLoading(true);

    try {
        // Step 1: Determine post type and fetch post details
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
            console.error("Post not found.");
            return;
        }

        const postData = { id: postSnap.id, ...postSnap.data(), type: postType } as PostDetails;
        setPostDetails(postData);

        // Step 2: Verify ownership
        const owner = user.uid === postData.employerId;
        setIsOwner(owner);
        if (!owner) {
            setLoading(false);
            return;
        }

        // Step 3: Fetch all applications for this post using the correct employerId filter
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('postId', '==', postId), where('employerId', '==', user.uid));
        const applicationsSnap = await getDocs(q).catch(serverError => {
             const permissionError = new FirestorePermissionError({ path: 'applications', operation: 'list', requestResourceData: {postId, employerId: user.uid} });
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
        
        // Step 4: Fetch profiles for the candidates
        const candidatePromises = candidateIds.map(id => getDoc(doc(db, 'candidates', id)).catch(serverError => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `/candidates/${id}`, operation: 'get' }));
            return null; // Return null on error to not break Promise.all
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
        // Error is already emitted in catch blocks, but we can have a generic one.
        if (!(error instanceof FirestorePermissionError)) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'jobs or applications',
                operation: 'list',
             }));
        }
    } finally {
        setLoading(false);
    }
  }, [postId]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPostAndApplicants(user);
      } else {
        setIsOwner(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchPostAndApplicants]);

  const candidatesByStage = (stageNameFromPipelineConfig: string) => {
    if (!stageNameFromPipelineConfig) return [];
    const rawStageName = stageNameFromPipelineConfig.split(' ')[0].toLowerCase().replace(/_/g, ' ');
    return applicants.filter(app => (app.status || 'Applied').toLowerCase().replace(/_/g, ' ') === rawStageName);
  };

  const handleStageClick = (stageConfig: Stage) => {
    if(!isOwner) return;
    const stageDisplayName = getStageName(stageConfig);
    const stageApplicants = candidatesByStage(stageConfig.stage);
    setSelectedStage({ stageName: stageDisplayName, candidates: stageApplicants });
    setIsDialogOpen(true);
  }

  const PageContent = (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts</Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{postDetails?.title || 'Loading...'}</h1>
                <p className="text-sm text-muted-foreground">Hiring Pipeline</p>
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
                    <p className="text-muted-foreground mt-2">You do not have permission to view the pipeline for this post.</p>
                </CardContent>
            </Card>
        ) : !postDetails || !postDetails.pipeline || postDetails.pipeline.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No pipeline configured for this post.</p>
                     <Button asChild variant="link">
                        <Link href={`/employer/jobs/edit/${postDetails?.id}`}>Edit post to add pipeline</Link>
                    </Button>
                </CardContent>
             </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle>Pipeline Stages</CardTitle>
                    <CardDescription>Click a stage to view the candidates within it.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {postDetails.pipeline.map((stageConfig, index) => {
                        if (!stageConfig || !stageConfig.stage) return null;
                        const stageDisplayName = getStageName(stageConfig);
                        const stageApplicants = candidatesByStage(stageConfig.stage);
                        return (
                             <Card 
                                key={index} 
                                className="flex flex-col justify-between p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer"
                                onClick={() => handleStageClick(stageConfig)}
                            >
                                <CardTitle className="text-lg capitalize flex items-center justify-between">
                                    {stageDisplayName}
                                    <Badge variant="secondary" className="text-lg">{stageApplicants.length}</Badge>
                                </CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <User className="w-4 h-4 mr-2" />
                                    <span>{stageApplicants.length} Candidates</span>
                                </div>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        )}
        {selectedStage && (
            <CandidateStageDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                stageName={selectedStage.stageName}
                candidates={selectedStage.candidates}
                postId={postId!}
                postType={postDetails?.type || 'job'}
            />
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
