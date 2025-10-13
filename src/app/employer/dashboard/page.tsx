'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, Star, Bookmark, Building, TestTube2, Bot, Bell, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  { name: "Applied", count: 4 },
  { name: "Invited", count: 2 },
  { name: "Skill Test", description: "AI/Manual", count: 2 },
  { name: "Interview", description: "AI/In-Person", count: 1 },
  { name: "Final Interview", description: "In-Person", count: 0 },
  { name: "Selection", count: 0 }
];


function SidebarNav() {
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Logo />
             <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
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
        </div>
    )
}

export default function EmployerDashboardPage() {
  return (
    <div className="min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40 overflow-x-hidden">
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-10 w-[280px] border-r bg-background dark:bg-gray-950">
             <SidebarNav />
        </aside>
        <div className="lg:pl-[280px]">
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden h-10 w-10">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarNav />
                    </SheetContent>
                </Sheet>
                 <div className="w-full flex-1 lg:hidden">
                    <Logo />
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>E</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-semibold text-2xl md:text-3xl">Welcome, Test LLC!</h1>
                  <p className="text-muted-foreground">Your command center for smart hiring. Let's find your next great hire.</p>
                </div>
                <Button asChild>
                    <Link href="/employer/jobs/new"><PlusCircle className="mr-2 h-4 w-4"/>Post a New Job</Link>
                </Button>
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

              <div className="grid gap-6 md:grid-cols-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hiring Pipeline Overview</CardTitle>
                      <CardDescription>A summary of your candidate progression stages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue={pipelineStages[0].name.toLowerCase()} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
                          {pipelineStages.map((stage) => (
                            <TabsTrigger key={stage.name} value={stage.name.toLowerCase()} className="flex-col h-auto py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{stage.name}</span>
                                <Badge variant={stage.count > 0 ? "default" : "secondary"}>{stage.count}</Badge>
                              </div>
                              {stage.description && <span className="text-xs text-muted-foreground mt-1">{stage.description}</span>}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {pipelineStages.map((stage) => (
                          <TabsContent key={stage.name} value={stage.name.toLowerCase()} className="mt-4">
                            <Card>
                              <CardContent className="p-6 text-center text-muted-foreground">
                                <p>Candidates in the "{stage.name}" stage will appear here.</p>
                                {stage.count > 0 && 
                                  <Button variant="outline" size="sm" className="mt-4">
                                      View {stage.count} candidate{stage.count > 1 ? 's' : ''}
                                  </Button>
                                }
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                    <div className="grid md:grid-cols-2 gap-6">
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
                         <Card className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 border-dashed border-green-200 dark:border-green-900">
                            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full mb-4">
                                <TestTube2 className="w-8 h-8 text-green-600 dark:text-green-400"/>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Manage AI Skill Tests</h3>
                            <p className="text-muted-foreground text-center mb-4 text-sm">Create, assign, and review AI-powered skill assessments for your candidates.</p>
                            <Button variant="outline" asChild>
                                <Link href="/employer/skill-tests">Go to Skill Tests</Link>
                            </Button>
                        </Card>
                    </div>
              </div>
            </main>
        </div>
    </div>
  );
}
