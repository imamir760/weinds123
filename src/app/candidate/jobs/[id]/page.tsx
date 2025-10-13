'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, MapPin, CheckCircle, DollarSign, Building } from "lucide-react";
import Link from "next/link";

const job = {
  id: 'job1',
  title: 'Frontend Developer',
  company: 'Innovate Inc.',
  location: 'Remote',
  type: 'Full-time',
  salary: '$90,000 - $120,000',
  description: 'We are seeking a passionate Frontend Developer to join our dynamic team. You will be responsible for building modern, responsive, and user-friendly web applications using React and Next.js.',
  responsibilities: [
    'Develop new user-facing features using React.js',
    'Build reusable components and front-end libraries for future use',
    'Translate designs and wireframes into high-quality code',
    'Optimize components for maximum performance across a vast array of web-capable devices and browsers'
  ],
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
};

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/candidate/jobs"><ArrowLeft className="mr-2" /> Back to Jobs</Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> {job.company}</p>
                    <CardTitle className="text-3xl font-bold font-headline mt-1">{job.title}</CardTitle>
                </div>
                <Button size="lg">Apply Now</Button>
            </div>
             <div className="flex gap-6 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {job.location}</div>
                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {job.type}</div>
                <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> {job.salary}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Job Description</h3>
              <p className="text-muted-foreground">{job.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Responsibilities</h3>
              <ul className="space-y-2 text-muted-foreground">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
            
             <div>
              <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <div key={skill} className="bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
