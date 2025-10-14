
'use client';

import { useState, useEffect, use } from 'react';
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

type JobDetails = DocumentData & {
  id: string;
  title: string;
  pipeline: Stage[];
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

type JobPipelinePageProps = {
  params: Promise<{ id: string }>;
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

export default function JobPipelinePage(props: JobPipelinePageProps) {
  const { id: jobId } = use(props.params);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchPipelineData = async () => {
      setLoading(true);
      try {
        // 1. Fetch job details to get the pipeline
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: jobRef.path, operation: 'get' }));
            throw error;
        });

        if (!jobSnap.exists()) {
          console.error("Job not found");
          setLoading(false);
          return;
        }
        const jobData = { id: jobSnap.id, ...jobSnap.data() } as JobDetails;
        setJobDetails(jobData);

        // 2. Fetch all applicants for this job from the subcollection
        const applicantsRef = collection(db, 'jobs', jobId, 'applicants');
        const applicantsSnap = await getDocs(applicantsRef).catch(error => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({ path: applicantsRef.path, operation: 'list' }));
             throw error;
        });
        const applicantsData = applicantsSnap.docs.map(d => ({ id: d.id, candidateId: d.id, ...d.data() })) as Applicant[];

        if (applicantsData.length === 0) {
            setApplicants([]);
            setLoading(false);
            return;
        }

        // 3. Fetch candidate profiles for all applicants
        const candidateIds = [...new Set(applicantsData.map(app => app.candidateId))];
        const candidatePromises = candidateIds.map(id => getDoc(doc(db, 'candidates', id)));
        const candidateSnaps = await Promise.all(candidatePromises);
        const candidatesMap = new Map(candidateSnaps.map(snap => [snap.id, snap.data()]));

        // 4. Merge applicant data with candidate profiles
        const mergedApplicants = applicantsData.map(app => {
            const profile = candidatesMap.get(app.candidateId);
            return {
                ...app,
                fullName: profile?.fullName || 'Unknown Candidate',
                headline: profile?.headline || 'No headline',
                avatar: profile?.fullName?.charAt(0) || 'U',
                matchScore: Math.floor(Math.random() * (98 - 75 + 1) + 75) // Mock score for now
            };
        });

        setApplicants(mergedApplicants);

      } catch (error) {
        console.error("Error fetching pipeline data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, [jobId]);

  const candidatesByStage = (stageNameFromPipelineConfig: string) => {
    // FIX: Add a guard to prevent crash if stage name is undefined
    if (!stageNameFromPipelineConfig) return [];
    // Normalize stage name by removing type info like (ai) and replacing underscores
    const rawStageName = stageNameFromPipelineConfig.split(' ')[0].toLowerCase().replace(/_/g, ' ');
     return applicants.filter(app => (app.currentStage || 'Applied').toLowerCase().replace(/_/g, ' ') === rawStageName);
  };

  const PageContent = (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{jobDetails?.title || 'Loading...'}</h1>
                <p className="text-sm text-muted-foreground">Hiring Pipeline</p>
            </div>
        </div>

        {loading ? (
            <Card>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        ) : !jobDetails || !jobDetails.pipeline || jobDetails.pipeline.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No pipeline configured for this job.</p>
                </CardContent>
             </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle>Pipeline Stages</CardTitle>
                    <CardDescription>Click a stage to see the candidates within it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full space-y-2">
                        {jobDetails.pipeline.map((stageConfig, index) => {
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
                                                                    <Link href={`/employer/jobs/${jobId}/candidates/${candidate.id}`}>View Profile</Link>
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
