
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, DocumentData } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2, DollarSign, Star, Building, PlusCircle, Sparkles, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useAuth } from '@/components/auth/auth-provider';
import { matchJobCandidate } from '@/ai/flows';
import { Badge } from '@/components/ui/badge';


interface Job extends DocumentData {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  salary: string;
  experience: string;
  skills: string;
  responsibilities: string;
  pipeline: { stage: string, type?: string }[];
  matchScore?: number;
  recommendedSkills?: string[];
  justification?: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    const jobsCollectionRef = collection(db, 'jobs');
    const unsubscribe = onSnapshot(jobsCollectionRef, async (snapshot) => {
      setLoading(true);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const employerIds = [...new Set(jobsData.map(job => job.employerId).filter(id => id))];
      
      if (employerIds.length > 0) {
        const employerPromises = employerIds.map(id => getDoc(doc(db, 'employers', id)));
        const employerSnapshots = await Promise.all(employerPromises);
        const employersMap = new Map(employerSnapshots.map(snap => [snap.id, snap.data()?.companyName || 'N/A']));
        
        const jobsWithCompanyNames = jobsData.map(job => ({
          ...job,
          companyName: employersMap.get(job.employerId) || 'N/A'
        })) as Job[];

        setJobs(jobsWithCompanyNames);
      } else {
        setJobs(jobsData as Job[]);
      }
      
      setLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: jobsCollectionRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && jobs.length > 0 && !matching) {
        const runMatching = async () => {
            setMatching(true);
            const candidateDocRef = doc(db, 'candidates', user.uid);
            const candidateSnap = await getDoc(candidateDocRef);

            if (!candidateSnap.exists()) {
                setMatching(false);
                return;
            }

            const candidateProfile = JSON.stringify(candidateSnap.data());
            
            const updatedJobs = await Promise.all(jobs.map(async (job) => {
                if (job.matchScore !== undefined) return job; // Already matched
                try {
                    const jobDescription = `Title: ${job.title}\nResponsibilities: ${job.responsibilities}\nSkills: ${job.skills}`;
                    const result = await matchJobCandidate({ candidateProfile, jobDescription });
                    return { ...job, ...result };
                } catch (error) {
                    console.error(`Failed to get match for job ${job.id}`, error);
                    return job; // Return original job if AI call fails
                }
            }));

            setJobs(updatedJobs);
            setMatching(false);
        };
        runMatching();
    }
  }, [user, jobs, matching]);


  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Job title or keyword" className="pl-10" />
                    </div>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Location" className="pl-10" />
                    </div>
                    <Button className="w-full md:w-auto">
                        <Filter className="mr-2" />
                        Search Jobs
                    </Button>
                </div>
            </CardContent>
        </Card>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="space-y-6">
                {jobs.map(job => (
                    <Card key={job.id} className="bg-card hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl font-headline">{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 pt-1"><Building className="w-4 h-4" /> {job.companyName}</CardDescription>
                                </div>
                                <div className="text-right flex items-center gap-3 bg-secondary p-2 rounded-lg">
                                    {job.matchScore === undefined ? (
                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-lg font-bold text-primary">{job.matchScore}%</p>
                                                <p className="text-xs text-muted-foreground -mt-1">AI Match</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground flex-wrap mb-4">
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {job.location || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {job.workMode || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> {job.salary || 'Not Disclosed'}</div>
                                <div className="flex items-center gap-1.5"><Star className="h-4 w-4"/> {job.experience || 'N/A'}</div>
                            </div>

                            {job.responsibilities && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {job.responsibilities}
                                </p>
                            )}

                            {job.pipeline && job.pipeline.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-sm mb-2">Hiring Pipeline</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {job.pipeline.map((stage, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Badge variant="secondary" className="capitalize">{stage.stage.replace(/_/g, ' ')}</Badge>
                                                {index < job.pipeline.length -1 && <ChevronsRight className="w-4 h-4 text-muted-foreground"/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {job.recommendedSkills && job.recommendedSkills.length > 0 && (
                                <div className="my-4">
                                    <h4 className="font-semibold text-sm mb-2">Recommended Skills to Add</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.recommendedSkills.map(skill => (
                                            <div key={skill} className="flex items-center gap-2 bg-primary/10 pl-3 pr-1 py-1 rounded-full">
                                                <span className="text-primary text-xs font-medium">{skill.trim()}</span>
                                                <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full bg-primary/20 hover:bg-primary/30">
                                                    <PlusCircle className="w-3 h-3 text-primary" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-end items-center mt-6 border-t pt-4">
                                <div className="flex gap-2">
                                    <Button asChild>
                                        <Link href={`/candidate/jobs/${job.id}`}>Apply Now</Link>
                                    </Button>
                                     <Button asChild variant="outline">
                                        <Link href={`/candidate/jobs/${job.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
         {!loading && jobs.length === 0 && (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No jobs posted yet. Check back soon!</p>
                </CardContent>
            </Card>
        )}
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
