
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, MoveHorizontal } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot, DocumentData, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import EmployerDashboardPage from '../../dashboard/page';

interface Candidate extends DocumentData {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarFallback: string;
  matchScore: number;
}

interface Applicant extends DocumentData {
  id: string;
  candidateId: string;
  currentStage: string;
  candidate?: Candidate;
}

interface Stage {
  name: string;
  type?: string;
}

interface JobDetails extends DocumentData {
    title: string;
    pipeline: Stage[];
}

const getStageName = (stage: Stage) => {
    if (!stage || !stage.name) return '';
    const stageName = stage.name.replace(/_/g, ' ');
    if (stage.type) {
      const typeName = stage.type.replace(/_/g, ' ');
      return `${stageName} (${typeName})`;
    }
    return stageName;
};

export default function JobPipelinePage({ params }: { params: { id: string } }) {
  const { id: jobId } = params;
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);

    const fetchJobAndApplicants = async () => {
        try {
            // 1. Fetch Job Details
            const jobDocRef = doc(db, 'jobs', jobId);
            const jobSnap = await getDoc(jobDocRef);

            if (!jobSnap.exists()) {
                console.error("Job not found");
                setLoading(false);
                return;
            }
            const jobData = jobSnap.data() as JobDetails;
            setJobDetails(jobData);

            // 2. Fetch Applicants
            const applicantsColRef = collection(db, 'jobs', jobId, 'applicants');
            const applicantsSnapshot = await getDocs(applicantsColRef);
            const applicantsData = applicantsSnapshot.docs.map(d => ({ id: d.id, candidateId: d.data().candidateId, currentStage: d.data().currentStage, ...d.data() } as Applicant));

            // 3. Fetch Candidate Profiles
            const candidateIds = [...new Set(applicantsData.map(app => app.candidateId))];
            if (candidateIds.length > 0) {
                const candidatePromises = candidateIds.map(id => getDoc(doc(db, 'candidates', id)));
                const candidateSnapshots = await Promise.all(candidatePromises);
                const candidateProfiles = new Map(candidateSnapshots.map(snap => [snap.id, snap.data()]));

                const applicantsWithProfiles = applicantsData.map(app => {
                    const profile = candidateProfiles.get(app.candidateId);
                    return {
                        ...app,
                        candidate: {
                            id: app.candidateId,
                            name: profile?.fullName || "Unknown",
                            // Placeholder for avatar and match score, as they aren't in the model
                            avatarUrl: `https://avatar.vercel.sh/${profile?.email || app.candidateId}.png`,
                            avatarFallback: (profile?.fullName || 'U').charAt(0),
                            matchScore: Math.floor(Math.random() * (98 - 75 + 1)) + 75, // Random score
                        }
                    }
                });
                setApplicants(applicantsWithProfiles);
            } else {
                setApplicants([]);
            }
        } catch (error) {
            console.error("Error fetching pipeline data:", error);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `/jobs/${jobId}`,
                operation: 'get'
            }));
        } finally {
            setLoading(false);
        }
    };
    
    fetchJobAndApplicants();
  }, [jobId]);

  const groupedApplicants = jobDetails?.pipeline.reduce((acc, stage) => {
    if (!stage || !stage.name) return acc;
    const stageKey = stage.type ? `${stage.name}_${stage.type}` : stage.name;
    const stageName = getStageName(stage);
    acc[stageName] = applicants.filter(app => {
        // A bit of logic to match simple stages vs typed stages
        if (app.currentStage.includes('(')) { // e.g. "skill_test (ai)"
             const [appStage, appType] = app.currentStage.replace(')', '').split(' (');
             return appStage === stage.name && appType === stage.type;
        }
        return app.currentStage === stage.name;
    });
    return acc;
  }, {} as Record<string, Applicant[]>) || {};


  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      ) : jobDetails ? (
        <>
            <div className="mb-8">
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/employer/jobs"><ArrowLeft className="mr-2" /> Back to Job Postings</Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Hiring Pipeline</h1>
                <p className="text-muted-foreground">{jobDetails.title}</p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
            {jobDetails.pipeline.map(stage => {
                const stageName = getStageName(stage);
                if (!stageName) return null;
                const candidatesInStage = groupedApplicants[stageName] || [];
                return (
                    <div key={stageName} className="w-80 flex-shrink-0">
                        <Card className="h-full bg-secondary/50 dark:bg-secondary/20">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg capitalize">
                            <span>{stageName}</span>
                            <span className="text-base font-normal text-muted-foreground bg-background px-2 py-0.5 rounded">
                                {candidatesInStage.length}
                            </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {candidatesInStage.map(applicant => applicant.candidate && (
                            <Card key={applicant.id} className="bg-background shadow-md hover:shadow-lg transition-shadow duration-300">
                                <Link href={`/employer/jobs/${jobId}/candidates/${applicant.candidateId}`}>
                                    <CardContent className="p-4 cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={applicant.candidate.avatarUrl} alt={applicant.candidate.name} />
                                            <AvatarFallback>{applicant.candidate.avatarFallback}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{applicant.candidate.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                            Match: <span className="font-bold text-primary">{applicant.candidate.matchScore}%</span>
                                            </p>
                                        </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <MoveHorizontal className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                    </CardContent>
                                </Link>
                            </Card>
                            ))}
                            {candidatesInStage.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                                Drag candidates here
                            </div>
                            )}
                        </CardContent>
                        </Card>
                    </div>
                )
            })}
            </div>
        </>
      ) : (
          <div className="text-center py-12 text-muted-foreground">
              <p>Job not found or you do not have permission to view it.</p>
          </div>
      )}
    </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>
}
