
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Star, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

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

export default function JobPipelinePage({ params }: { params: { id: string } }) {
  const { id: postId } = React.use(params);
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPipelineData = async () => {
      setLoading(true);
      try {
        let postSnap;
        let postType: 'job' | 'internship' | null = null;
        
        const jobRef = doc(db, 'jobs', postId);
        try {
            postSnap = await getDoc(jobRef);
            if (postSnap.exists()) {
              postType = 'job';
            }
        } catch (error) {
            const permissionError = new FirestorePermissionError({ path: jobRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
            return;
        }

        if (!postType) {
            const internshipRef = doc(db, 'internships', postId);
            try {
                postSnap = await getDoc(internshipRef);
                if (postSnap.exists()) {
                    postType = 'internship';
                }
            } catch (error) {
                const permissionError = new FirestorePermissionError({ path: internshipRef.path, operation: 'get' });
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
                return;
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

    fetchPipelineData();
  }, [postId]);

  const candidatesByStage = (stageNameFromPipelineConfig: string) => {
    if (!stageNameFromPipelineConfig) return [];
    const rawStageName = stageNameFromPipelineConfig.split(' ')[0].toLowerCase().replace(/_/g, ' ');
     return applicants.filter(app => (app.currentStage || 'Applied').toLowerCase().replace(/_/g, ' ') === rawStageName);
  };

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
                    <CardDescription>Click a stage to see the candidates within it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={['item-0']} className="w-full space-y-2">
                        {postDetails.pipeline.map((stageConfig, index) => {
                            const stageDisplayName = getStageName(stageConfig);
                            const stageApplicants = candidatesByStage(stageConfig.stage);
                            return (
                                <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg">
                                    <AccordionTrigger className="hover:no-underline p-4 text-lg font-semibold capitalize">
                                        <div className="flex justify-between items-center w-full">
                                            <span>{stageDisplayName}</span>
                                            <Badge variant="secondary" className="text-base">{stageApplicants.length}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                        <Separator className="mb-4"/>
                                        {stageApplicants.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {stageApplicants.map(candidate => (
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
                                                                    <Link href={`/employer/jobs/${postId}/candidates/${candidate.id}`}>View Profile</Link>
                                                                </Button>
                                                                <Button size="sm">
                                                                    Next Stage <ChevronsRight className="w-4 h-4 ml-2"/>
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                <p>No candidates in this stage.</p>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}

    