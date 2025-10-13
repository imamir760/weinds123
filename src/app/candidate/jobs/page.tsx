'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';

interface Job extends DocumentData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  match: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsCollectionRef = collection(db, 'jobs');
    const unsubscribe = onSnapshot(jobsCollectionRef, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Job));
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                    <Card key={job.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{job.title}</CardTitle>
                                    <CardDescription>{job.company || 'N/A'}</CardDescription>
                                </div>
                                {job.match && (
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">{job.match}% Match</p>
                                        <p className="text-xs text-muted-foreground">Compatibility Score</p>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex gap-4 text-sm text-muted-foreground mb-4 md:mb-0">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4"/>
                                        <span>{job.location}</span>
                                    </div>
                                     <div className="flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4"/>
                                        <span>{job.workMode || 'N/A'}</span>
                                    </div>
                                </div>
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
