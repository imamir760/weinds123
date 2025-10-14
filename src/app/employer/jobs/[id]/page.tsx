
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Stage = {
  name: string;
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

const getStageName = (stage: Stage) => {
    if (!stage || !stage.name) return '';
    const stageName = stage.name.replace(/_/g, ' ');
    if (stage.type) {
      const typeName = stage.type.replace(/_/g, ' ');
      return `${stageName} (${typeName})`;
    }
    return stageName;
};


export default function JobPipelinePage({ params: { id: jobId } }: { params: { id: string } }) {
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
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          console.error("Job not found");
          setLoading(false);
          return;
        }
        const jobData = { id: jobSnap.id, ...jobSnap.data() } as JobDetails;
        setJobDetails(jobData);

        // 2. Fetch all applicants for this job
        const applicantsRef = collection(db, 'jobs', jobId, 'applicants');
        const applicantsSnap = await getDocs(applicantsRef);
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

  const candidatesByStage = (stageName: string) => {
    const rawStageName = stageName.split(' ')[0].toLowerCase();
    return applicants.filter(app => (app.currentStage || 'applied').toLowerCase() === rawStageName);
  };

  const PageContent = (
      <div className="flex flex-col h-full">
         <header className="p-4 border-b">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{jobDetails?.title || 'Loading...'}</h1>
                        <p className="text-sm text-muted-foreground">Hiring Pipeline</p>
                    </div>
                </div>
                <div>
                    <Button>Manage Job</Button>
                </div>
            </div>
        </header>

        {loading ? (
            <div className="flex-1 flex justify-center items-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        ) : !jobDetails || !jobDetails.pipeline || jobDetails.pipeline.length === 0 ? (
             <div className="flex-1 flex justify-center items-center text-muted-foreground">
                <p>No pipeline configured for this job.</p>
            </div>
        ) : (
             <div className="flex-1 overflow-x-auto">
                 <div className="flex h-full p-4 gap-6 min-w-max">
                    {jobDetails.pipeline.map((stage, index) => {
                        const stageApplicants = candidatesByStage(getStageName(stage));
                        return (
                            <div key={index} className="w-[300px] flex-shrink-0 flex flex-col">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h2 className="font-semibold capitalize text-lg">{getStageName(stage)}</h2>
                                    <Badge variant="secondary">{stageApplicants.length}</Badge>
                                </div>
                                <motion.div
                                    layout
                                    className="bg-secondary/50 rounded-lg p-2 flex-1 flex flex-col gap-3 overflow-y-auto min-h-[200px]"
                                >
                                    {stageApplicants.map((candidate, i) => (
                                         <motion.div
                                            key={candidate.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            className="bg-background rounded-lg shadow-sm border cursor-grab active:cursor-grabbing"
                                        >
                                           <Link href={`/employer/jobs/${jobId}/candidates/${candidate.id}`}>
                                            <CardContent className="p-3">
                                                 <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                         <Avatar className="w-10 h-10 border">
                                                            <AvatarFallback>{candidate.avatar}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-sm">{candidate.fullName}</p>
                                                            <p className="text-xs text-muted-foreground">{candidate.headline}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-primary font-bold text-sm">
                                                        <Star className="w-4 h-4 fill-primary"/>
                                                        {candidate.matchScore}%
                                                    </div>
                                                </div>
                                            </CardContent>
                                          </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        )
                    })}
                 </div>
            </div>
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
