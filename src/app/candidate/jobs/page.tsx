'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import Link from 'next/link';

const jobs = [
    { id: 'job1', title: 'Frontend Developer', company: 'Innovate Inc.', location: 'Remote', type: 'Full-time', match: 92 },
    { id: 'job2', title: 'Product Designer', company: 'Creative Solutions', location: 'New York, NY', type: 'Full-time', match: 88 },
    { id: 'job3', title: 'Data Scientist', company: 'Analytics Co.', location: 'San Francisco, CA', type: 'Contract', match: 85 },
    { id: 'job4', title: 'Backend Engineer', company: 'Data Solutions', location: 'Remote', type: 'Full-time', match: 76 },
    { id: 'job5', title: 'Marketing Manager', company: 'Growth Co.', location: 'Austin, TX', type: 'Full-time', match: 65 },
];

export default function JobsPage() {
  return (
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

        <div className="space-y-6">
            {jobs.map(job => (
                <Card key={job.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">{job.match}% Match</p>
                                <p className="text-xs text-muted-foreground">Compatibility Score</p>
                            </div>
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
                                    <span>{job.type}</span>
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
    </div>
  );
}
