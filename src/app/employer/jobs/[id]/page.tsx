
'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Star, ChevronsRight, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { onAuthStateChanged } from 'firebase/auth';

type Stage = {
  stage: string;
  type?: string;
};

type PostDetails = DocumentData & {
  id: string;
  title: string;
  pipeline: Stage[];
  type: 'job' | 'internship';
};

type Applicant = DocumentData & {
  id: string; // This is the candidate's UID
  candidateId: string;
  currentStage: string;
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
                            <Card key={candidate.id} className="bg-background/50 shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 group">
                                            <Avatar className="w-11 h-11 border-2 border-primary/20">
                                                <AvatarFallback>{candidate.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-base">{candidate.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{candidate.headline}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-primary font-bold text-sm">
                                            <Star className="w-4 h-4 fill-primary"/>
                                            {candidate.matchScore}%
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-3">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/employer/${postType}s/${postId}/candidates/${candidate.id}`}>View Profile</Link>
                                        </Button>
                                        <Button size="sm">
                                            Next Stage <ChevronsRight className="w-4 h-4 ml-2"/>
                                        </Button>
                                    </div>
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
  const { id: postId } = params;
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{ stageName: string; candidates: Applicant[] } | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchPipelineData = async () => {
      setLoading(true);
      try {
        let postSnap;
        let postType: 'job' | 'internship' | null = null;
        
        const jobRef = doc(db, 'jobs', postId);
        postSnap = await getDoc(jobRef).catch(err => { console.error("Error checking job doc", err); return null; });
        if (postSnap && postSnap.exists()) {
            postType = 'job';
        }

        if (!postType) {
            const internshipRef = doc(db, 'internships', postId);
            postSnap = await getDoc(internshipRef).catch(err => { console.error("Error checking internship doc", err); return null; });
            if (postSnap && postSnap.exists()) {
                postType = 'internship';
            }
        }
        
        if (!postSnap?.exists() || !postType) {
          console.error("Post not found");
          setPostDetails(null);
          setLoading(false);
          return;
        }

        const postData = { id: postSnap.id, ...postSnap.data(), type: postType } as PostDetails;
        setPostDetails(postData);

        const applicantsCollectionRef = collection(db, postType, postId, 'applicants');
        const applicantsSnap = await getDocs(applicantsCollectionRef).catch(error => {
            const permissionError = new FirestorePermissionError({ path: applicantsCollectionRef.path, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // Stop execution
        });
        
        const applicantsData = applicantsSnap.docs.map(d => ({ 
            id: d.id, 
            candidateId: d.id, 
            ...d.data() 
        })) as Applicant[];

        if (applicantsData.length === 0) {
            setApplicants([]);
            setLoading(false);
            return;
        }

        const candidateIds = [...new Set(applicantsData.map(app => app.candidateId))];
        const candidatePromises = candidateIds.map(id => 
            getDoc(doc(db, 'candidates', id)).catch(error => {
                const permissionError = new FirestorePermissionError({ path: `/candidates/${id}`, operation: 'get' });
                errorEmitter.emit('permission-error', permissionError);
                return null; // Return null on error to not break Promise.all
            })
        );
        const candidateSnaps = await Promise.all(candidatePromises);
        
        const candidatesMap = new Map<string, DocumentData>();
        candidateSnaps.forEach(snap => {
            if (snap && snap.exists()) {
                candidatesMap.set(snap.id, snap.data());
            }
        });

        const mergedApplicants = applicantsData.map(app => {
            const profile = candidatesMap.get(app.candidateId);
            return {
                ...app,
                fullName: profile?.fullName || 'Unknown Candidate',
                headline: profile?.headline || 'No headline available',
                avatar: profile?.fullName?.charAt(0) || 'U',
                matchScore: Math.floor(Math.random() * (98 - 75 + 1) + 75) // Mock score for now
            };
        });

        setApplicants(mergedApplicants);

      } catch (error) {
        console.error("Error fetching pipeline data: ", error);
        // Errors are emitted in the individual catch blocks.
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchPipelineData();
        } else {
          console.log("User is not authenticated. Cannot fetch pipeline data.");
          setLoading(false);
        }
    });

    return () => unsubscribe();
  }, [postId]);

  const candidatesByStage = (stageNameFromPipelineConfig: string) => {
    if (!stageNameFromPipelineConfig) return [];
    // Normalize stage name by removing type info like (ai) and replacing underscores
    const rawStageName = stageNameFromPipelineConfig.split(' ')[0].toLowerCase().replace(/_/g, ' ');
     return applicants.filter(app => (app.currentStage || 'Applied').toLowerCase().replace(/_/g, ' ') === rawStageName);
  };
  
  const handleStageClick = (stageConfig: Stage) => {
    const stageDisplayName = getStageName(stageConfig);
    const stageCandidates = candidatesByStage(stageConfig.stage);
    setSelectedStage({ stageName: stageDisplayName, candidates: stageCandidates });
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
        ) : !postDetails || !postDetails.pipeline || postDetails.pipeline.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No pipeline configured for this post. Please edit the post to add a hiring pipeline.</p>
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
                postId={postId}
                postType={postDetails?.type || 'job'}
            />
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}

    