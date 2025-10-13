'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, BarChart } from 'lucide-react';
import Link from 'next/link';

const jobPosts = [
  {
    id: 'job1',
    title: 'Senior Frontend Developer',
    applications: 78,
    status: 'Active',
  },
  {
    id: 'job2',
    title: 'UX/UI Designer',
    applications: 45,
    status: 'Active',
  },
  {
    id: 'job3',
    title: 'Backend Engineer (Node.js)',
    applications: 102,
    status: 'Paused',
  },
];

const insights = [
  {
    title: 'Average Match Score',
    value: '82%',
    icon: <BarChart className="w-6 h-6 text-primary" />,
    description: 'Across all active jobs',
  },
  {
    title: 'Total Applications',
    value: '225',
    icon: <Users className="w-6 h-6 text-primary" />,
    description: 'In the last 30 days',
  },
  {
    title: 'Active Jobs',
    value: '2',
    icon: <Briefcase className="w-6 h-6 text-primary" />,
    description: 'Currently accepting candidates',
  },
];

export default function EmployerDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Employer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your hiring pipelines and talent acquisition efforts.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <Button asChild>
            <Link href="/employer/jobs/new">
              <PlusCircle className="mr-2" />
              Post New Job
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/employer/campus">Start Campus Drive</Link>
          </Button>
        </div>
      </div>

      <section id="quick-insights" className="mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {insight.title}
                </CardTitle>
                {insight.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insight.value}</div>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="active-jobs">
        <h2 className="text-2xl font-bold font-headline mb-4">
          Active Job Posts
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobPosts.map(job => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="truncate">{job.title}</CardTitle>
                <CardDescription>
                  Status:{' '}
                  <span
                    className={
                      job.status === 'Active'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                    }
                  >
                    {job.status}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{job.applications}</p>
                    <p className="text-sm text-muted-foreground">
                      Applications
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/employer/jobs/${job.id}`}>View Pipeline</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
