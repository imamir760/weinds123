'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, Star, Bookmark, Building, TestTube2, Bot, User, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';

const navigation = [
    { name: 'Dashboard', href: '/employer/dashboard', icon: Briefcase, current: true },
    { name: 'Job Postings', href: '/employer/jobs', icon: Briefcase, count: 8 },
    { name: 'All Applicants', href: '/employer/all-candidates', icon: Users },
    { name: 'Shortlisted', href: '/employer/shortlisted', icon: Star },
    { name: 'Final Interviews', href: '/employer/final-interview', icon: Bot },
    { name: 'Campus Pool', href: '/employer/campus', icon: Building },
    { name: 'AI Skill Tests', href: '/employer/skill-tests', icon: TestTube2 },
    { name: 'AI Interviews', href: '/employer/interviews', icon: Bot },
    { name: 'Company Profile', href: '/employer/profile', icon: User },
];

const insights = [
  {
    title: 'Active Jobs',
    value: '8',
    icon: <Briefcase className="w-6 h-6 text-orange-500" />,
    description: '+0 since last month',
  },
  {
    title: 'Total Candidates',
    value: '10',
    icon: <Users className="w-6 h-6 text-green-500" />,
    description: '+0 since last month',
  },
  {
    title: 'Shortlisted',
    value: '6',
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    description: '+0 since last week',
  },
  {
    title: 'Hired This Month',
    value: '1',
    icon: <Bookmark className="w-6 h-6 text-indigo-500" />,
    description: '+0 this week',
  },
];

const pipelineStages = [
    "Applied", "Shortlisted", "AI Skill Test", "AI Interview", "Hired"
];

export default function EmployerDashboardPage() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 fixed h-full w-[280px]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Logo />
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    item.current
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.count && (
                      <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200/80 text-xs dark:bg-gray-700/80">{item.count}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
                <CardHeader className="p-4">
                    <CardTitle>Post a Job</CardTitle>
                    <CardDescription className="text-xs">Get your job listing in front of thousands of candidates.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <Link href="/employer/jobs/new">
                           <PlusCircle className="mr-2 h-4 w-4" /> Post Job
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-gray-50/50 dark:bg-gray-900/50 ml-0 lg:ml-[280px]">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white dark:bg-gray-800/40 px-6 sticky top-0 z-30">
            <div className="flex-1">
                {/* Potentially a mobile sidebar toggle can be added here */}
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5"/>
                    <span className="sr-only">Toggle notifications</span>
                </Button>
                <Avatar className="h-9 w-9">
                    <AvatarFallback>T</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <div>
              <h1 className="font-semibold text-2xl md:text-3xl">Welcome, Test LLC!</h1>
              <p className="text-muted-foreground">Your command center for smart hiring. Let's find your next great hire.</p>
            </div>
          </div>
          
          <section id="quick-insights">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {insights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {insight.title}
                    </CardTitle>
                    {insight.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{insight.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="pipeline">
            <Card>
                <CardHeader>
                    <CardTitle>Hiring Pipeline Overview</CardTitle>
                    <CardDescription>A summary of your candidate progression stages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2">
                        {pipelineStages.map((stage, index) => (
                            <div key={stage} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border-2 border-primary">{index + 1}</div>
                                    <p className="text-xs text-center mt-1 w-20">{stage}</p>
                                </div>
                                {index < pipelineStages.length - 1 && (
                                   <div className="flex-1 h-px bg-border w-8 md:w-16 mx-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </section>

          <section id="actions">
             <div className="grid md:grid-cols-2 gap-6">
                <Card className="flex flex-col items-center justify-center p-8 bg-primary/5 dark:bg-primary/10 border-dashed border-primary/20 dark:border-primary/30">
                    <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-4">
                        <PlusCircle className="w-8 h-8 text-primary"/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Post a New Job</h3>
                    <p className="text-muted-foreground text-center mb-4 text-sm">Get your job listing in front of thousands of experienced professionals.</p>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                        <Link href="/employer/jobs/new">Create Job Post</Link>
                    </Button>
                </Card>
                <Card className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 border-dashed border-blue-200 dark:border-blue-900">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Explore Campus Talent</h3>
                    <p className="text-muted-foreground text-center mb-4 text-sm">Discover promising new talent from top colleges across the country.</p>
                    <Button variant="outline" asChild>
                        <Link href="/employer/campus">View Campus Pool</Link>
                    </Button>
                </Card>
             </div>
          </section>
        </main>
      </div>
    </div>
  );
}
