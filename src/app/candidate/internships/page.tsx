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
import CandidateDashboardLayout from '../dashboard/page';

const internships = [
    { id: 'int1', title: 'Frontend Development Intern', company: 'Innovate Inc.', location: 'Remote', type: '3 months', match: 92 },
    { id: 'int2', title: 'Product Design Intern', company: 'Creative Solutions', location: 'New York, NY', type: '6 months', match: 88 },
    { id: 'int3', title: 'Data Science Intern', company: 'Analytics Co.', location: 'San Francisco, CA', type: '3 months', match: 85 },
];

export default function InternshipsPage() {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Internship title or keyword" className="pl-10" />
                    </div>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Location" className="pl-10" />
                    </div>
                    <Button className="w-full md:w-auto">
                        <Filter className="mr-2" />
                        Search Internships
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-6">
            {internships.map(internship => (
                <Card key={internship.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{internship.title}</CardTitle>
                                <CardDescription>{internship.company}</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">{internship.match}% Match</p>
                                <p className="text-xs text-muted-foreground">Compatibility Score</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex gap-4 text-sm text-muted-foreground mb-4 md:mb-0">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4"/>
                                    <span>{internship.location}</span>
                                </div>
                                 <div className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4"/>
                                    <span>{internship.type}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild>
                                    <Link href={`/candidate/jobs/${internship.id}`}>Apply Now</Link>
                                </Button>
                                 <Button asChild variant="outline">
                                    <Link href={`/candidate/jobs/${internship.id}`}>View Details</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
