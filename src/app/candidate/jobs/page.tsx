'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2, DollarSign, Star, Building } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Job extends DocumentData {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  match: number;
  salary: string;
  experience: string;
  skills: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsCollectionRef = collection(db, 'jobs');
    const unsubscribe = onSnapshot(jobsCollectionRef, async (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const employerIds = [...new Set(jobsData.map(job => job.employerId).filter(id => id))];
      let employersMap: { [key: string]: string } = {};

      if (employerIds.length > 0) {
        const employerPromises = employerIds.map(id => {
            const docRef = doc(db, 'employers', id);
            return getDoc(docRef).catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                return null;
            });
        });
        const employerDocs = await Promise.all(employerPromises);
        
        employerDocs.forEach(docSnap => {
            if (docSnap && docSnap.exists()) {
                employersMap[docSnap.id] = docSnap.data().companyName;
            }
        });
      }

      const populatedJobs = jobsData.map(job => ({
        ...job,
        companyName: employersMap[job.employerId] || 'N/A',
      })) as Job[];


      setJobs(populatedJobs);
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
                                    <CardDescription className="flex items-center gap-2 pt-1"><Building className="w-4 h-4" /> {job.companyName}</CardDescription>
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
                             <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground flex-wrap mb-4">
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {job.location || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {job.workMode || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> {job.salary || 'Not Disclosed'}</div>
                                <div className="flex items-center gap-1.5"><Star className="h-4 w-4"/> {job.experience || 'N/A'}</div>
                            </div>

                            {job.skills && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-sm mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.split(',').slice(0, 5).map(skill => (
                                            <div key={skill} className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                                                {skill.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                                <div/>
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
