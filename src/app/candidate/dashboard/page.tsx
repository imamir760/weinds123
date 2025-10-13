'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, Bot, Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/candidate/dashboard', icon: Briefcase },
  { name: 'My Profile', href: '/candidate/profile', icon: User },
  { name: 'My Applications', href: '/candidate/applications', icon: FileText },
  { name: 'Disha AI', href: '/candidate/disha', icon: Bot },
  { name: 'Settings', href: '/candidate/settings', icon: Settings },
];

const recommendedJobs = [
  {
    id: 'job1',
    title: 'Frontend Developer',
    company: 'Innovate Inc.',
    match: 92,
  },
  {
    id: 'job2',
    title: 'Product Designer',
    company: 'Creative Solutions',
    match: 88,
  },
  {
    id: 'job3',
    title: 'Data Scientist',
    company: 'Analytics Co.',
    match: 85,
  },
];

const ongoingApplications = [
    { id: 'app1', title: 'Senior Frontend Developer', company: 'TechCorp', status: 'AI Skill Test' },
    { id: 'app2', title: 'UX/UI Designer', company: 'DesignHub', status: 'Shortlisted' },
];


export default function CandidateDashboardPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link
              href="/candidate/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Briefcase className="h-6 w-6" />
              <span>Candidate Space</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button size="sm" variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Welcome Back, Candidate!</h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>Resume Completeness</CardTitle>
                    <CardDescription>A complete resume attracts more recruiters.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-primary h-2.5 rounded-full w-[75%]"></div>
                    </div>
                    <p className="text-sm text-center mt-2 text-muted-foreground">75% Complete</p>
                    <Button asChild size="sm" className="mt-4 w-full">
                        <Link href="/candidate/resume-builder">Update Resume</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>AI Recommended Jobs</CardTitle>
                    <CardDescription>Jobs matched to your profile by our AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recommendedJobs.map(job => (
                             <div key={job.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{job.title}</p>
                                    <p className="text-sm text-muted-foreground">{job.company}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-semibold text-primary">{job.match}% Match</p>
                                     <Button asChild variant="outline" size="sm" className="mt-1">
                                        <Link href={`/candidate/jobs/${job.id}`}>View</Link>
                                     </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>

           <Card>
              <CardHeader>
                <CardTitle>Ongoing Applications</CardTitle>
                <CardDescription>Track the status of your job applications.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ongoingApplications.map(app => (
                    <div key={app.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{app.title}</p>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{app.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}
