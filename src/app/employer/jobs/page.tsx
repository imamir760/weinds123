'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, MoreVertical } from 'lucide-react';
import Link from 'next/link';

const jobs = [
    { id: 'job1', title: 'Senior Frontend Developer', status: 'Active', candidates: 12, shortlisted: 4 },
    { id: 'job2', title: 'UX/UI Designer', status: 'Active', candidates: 25, shortlisted: 8 },
    { id: 'job3', title: 'Data Scientist', status: 'Paused', candidates: 40, shortlisted: 5 },
    { id: 'job4', title: 'Backend Engineer', status: 'Closed', candidates: 78, shortlisted: 10 },
];

export default function EmployerJobsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold font-headline">Job Postings</h1>
              <p className="text-muted-foreground">Manage your active and inactive job listings.</p>
          </div>
          <Button asChild>
              <Link href="/employer/jobs/new">
                  <PlusCircle className="mr-2" /> Post New Job
              </Link>
          </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <Card key={job.id}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{job.title}</CardTitle>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4"/>
                    </Button>
                </div>
              <CardDescription>Status: <span className={`font-semibold ${job.status === 'Active' ? 'text-green-500' : 'text-amber-500'}`}>{job.status}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{job.candidates} Applicants</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.shortlisted} Shortlisted</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="w-full">
                        <Link href={`/employer/jobs/${job.id}`}>View Pipeline</Link>
                    </Button>
                     <Button asChild variant="outline">
                        <Link href={`/employer/jobs/edit/${job.id}`}>Edit</Link>
                    </Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
