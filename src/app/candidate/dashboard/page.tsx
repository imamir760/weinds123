'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, Bot, Settings, LogOut, User, Search, BarChart2, Star, Menu } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/auth-provider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/candidate/dashboard', icon: Briefcase, current: true },
  { name: 'My Profile', href: '/candidate/profile', icon: User },
  { name: 'My Applications', href: '/candidate/applications', icon: FileText },
  { name: 'Find Jobs', href: '/candidate/jobs', icon: Search },
  { name: 'AI Interviews', href: '/candidate/ai-interviews', icon: Bot },
  { name: 'Resume Builder', href: '/candidate/resume-builder', icon: FileText },
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


function SidebarNav() {
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out."
        });
        router.push('/');
    }

    return (
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-50`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button size="sm" variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
    )
}

function DashboardContent() {
    return (
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
    )
}

export default function CandidateDashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-10 w-[280px] border-r bg-background dark:bg-gray-950">
             <SidebarNav />
        </aside>
        <div className="lg:pl-[280px]">
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden h-10 w-10 shrink-0">
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
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            {children ? children : <DashboardContent />}
        </div>
    </div>
  );
}
