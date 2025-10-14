
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, DocumentData, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2, DollarSign, Star, Building, PlusCircle, Sparkles, ChevronsRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useAuth } from '@/components/auth/auth-provider';
import { matchJobCandidate } from '@/ai/flows';
import { Badge } from '@/components/ui/badge';
import { applyToAction } from '@/lib/apply-action';
import { useToast } from '@/hooks/use-toast';

interface Job extends DocumentData {
  id: string;
  title: string;
  employerId: string;
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
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const appliedJobsRef = collection(db, 'applications');
      const q = query(appliedJobsRef, where('candidateId', '==', user.uid), where('postType', '==', 'job'));
      const unsubscribeApplied = onSnapshot(q, (snapshot) => {
        const appliedIds = snapshot.docs.map(doc => doc.data().postId);
        setAppliedJobs(appliedIds);
      }, async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: appliedJobsRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribeApplied();
    }
  }, [user]);

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
        try {
          const employerPromises = employerIds.map(id => getDoc(doc(db, 'employers', id)).catch(async (error) => {
              const permissionError = new FirestorePermissionError({ path: `/employers/${id}`, operation: 'get' });
              errorEmitter.emit('permission-error', permissionError);
              return null;
          }));
          const employerSnapshots = await Promise.all(employerPromises);
          const employersMap = new Map(employerSnapshots.map(snap => snap ? [snap.id, snap.data()?.companyName || 'N/A'] : [null, null]));
          
          const jobsWithCompanyNames = jobsData.map(job => ({
            ...job,
            companyName: employersMap.get(job.employerId) || 'N/A'
          })) as Job[];

          setJobs(jobsWithCompanyNames);
        } catch (error) {
            console.error("Error fetching employer data:", error);
            // Even if employer data fails, show jobs with default company name
            setJobs(jobsData.map(j => ({ ...j, companyName: 'N/A' })) as Job[]);
        }
      } else {
        setJobs(jobsData as Job[]);
      }
      
      setLoading(false);
    }, async (serverError) => {
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
            let candidateProfile: string;

            try {
                const candidateSnap = await getDoc(candidateDocRef).catch(async (error) => {
                    const permissionError = new FirestorePermissionError({ path: candidateDocRef.path, operation: 'get' });
                    errorEmitter.emit('permission-error', permissionError);
                    throw permissionError;
                });
                if (!candidateSnap.exists()) {
                    console.warn("Candidate profile not found. Skipping AI matching.");
                    setMatching(false);
                    return;
                }
                candidateProfile = JSON.stringify(candidateSnap.data());
            } catch (error) {
                console.error("Failed to fetch candidate profile:", error);
                setMatching(false);
                return;
            }
            
            const jobsToMatch = jobs.filter(job => job.matchScore === undefined);

            for (const job of jobsToMatch) {
                try {
                    const jobDescription = `Title: ${job.title}\nResponsibilities: ${job.responsibilities}\nSkills: ${job.skills}`;
                    const result = await matchJobCandidate({ candidateProfile, jobDescription });
                    
                    setJobs(prevJobs => 
                        prevJobs.map(j => 
                            j.id === job.id ? { ...j, ...result } : j
                        )
                    );
                } catch (error) {
                    console.error(`Failed to get match for job ${job.id}`, error);
                    setJobs(prevJobs => 
                        prevJobs.map(j => 
                            j.id === job.id ? { ...j, matchScore: -1 } : j
                        )
                    );
                }
            }

            setMatching(false);
        };
        runMatching();
    }
  }, [user, jobs.length, matching]);

  const getPipelineStageName = (stage: { stage: string, type?: string }) => {
    const stageName = stage.stage.replace(/_/g, ' ');
    if (stage.type) {
      const typeName = stage.type.replace(/_/g, ' ');
      return `${stageName} (${typeName})`;
    }
    return stageName;
  };
  
  const handleApply = (job: Job) => {
    if (user) {
      applyToAction('job', job.id, job.employerId, job.title, job.companyName, user.uid);
      toast({
        title: "Application Sent!",
        description: `You have successfully applied for ${job.title}.`,
      });
    } else {
       toast({
        title: "Please log in",
        description: `You need to be logged in to apply.`,
        variant: "destructive",
      });
    }
  }


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
                                    ) : job.matchScore === -1 ? (
                                        <span className="text-xs text-destructive">Error</span>
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
                                                <Badge variant="secondary" className="capitalize">{getPipelineStageName(stage)}</Badge>
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
                                    {appliedJobs.includes(job.id) ? (
                                        <Button disabled variant="outline"><CheckCircle className="mr-2"/> Applied</Button>
                                    ) : (
                                        <Button onClick={() => handleApply(job)}>Apply Now</Button>
                                    )}
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
