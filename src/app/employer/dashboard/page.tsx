
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, Star, Bookmark, Building, TestTube2, Bot, Bell, Menu, User, Filter, LogOut, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { PostJobDialog } from '@/components/employer/post-job-dialog';
import { CreatePipelineDialog } from '@/components/employer/create-pipeline-dialog';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const navigation = [
    { name: 'Dashboard', href: '/employer/dashboard', icon: Briefcase, current: true },
    { name: 'My Postings', href: '/employer/jobs', icon: Briefcase, count: 8 },
    { name: 'All Applicants', href: '/employer/all-candidates', icon: Users },
    { name: 'Shortlisted', href: '/employer/shortlisted', icon: Star },
    { name: 'Final Interviews', href: '/employer/final-interview', icon: Bot },
    { name: 'Campus Pool', href: '/employer/campus', icon: Building },
    { name: 'AI Skill Tests', href: '/employer/skill-tests', icon: TestTube2 },
    { name: 'AI Interviews', href: '/employer/interviews', icon: Bot },
    { name: 'Company Profile', href: '/employer/profile', icon: User },
];

const initialPipelineStages = [
  { name: "Applied", id: "applied", count: 0, color: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-600 dark:text-orange-400" },
  { name: "Shortlisted", id: "shortlisted", count: 0, color: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-600 dark:text-yellow-400" },
  { name: "Skill Test", id: "skill_test", count: 0, color: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-600 dark:text-green-400" },
  { name: "Interview", id: "interview", count: 0, color: "bg-green-200 dark:bg-green-800/40", textColor: "text-green-700 dark:text-green-300" },
  { name: "Final Interview", id: "final_interview", count: 0, color: "bg-teal-100 dark:bg-teal-900/30", textColor: "text-teal-600 dark:text-teal-400" },
  { name: "Selection", id: "selection", count: 0, color: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-600 dark:text-blue-400" },
  { name: "Hired", id: "hired", count: 0, color: "bg-indigo-100 dark:bg-indigo-900/30", textColor: "text-indigo-600 dark:text-indigo-400" },
  { name: "Rejected", id: "rejected", count: 0, color: "bg-slate-100 dark:bg-slate-800", textColor: "text-slate-600 dark:text-slate-400" }
];

type Applicant = DocumentData & {
  id: string; // This is the candidate's UID
  candidateId: string;
  currentStage: string;
  postType: 'job' | 'internship';
  postId: string;
  fullName?: string;
  headline?: string;
  avatar?: string;
};


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

const CandidateStageDialog = ({ isOpen, onOpenChange, stageName, candidates, postType }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    stageName: string;
    candidates: Applicant[];
    postType: 'job' | 'internship';
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Candidates in "{stageName}"</DialogTitle>
                    <DialogDescription>{candidates.length} candidate(s) in this stage.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                    {candidates.length > 0 ? (
                        candidates.map(candidate => (
                            <Card key={`${candidate.postId}-${candidate.id}`} className="bg-background/50 shadow-sm">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3 group">
                                        <Avatar className="w-11 h-11 border-2 border-primary/20">
                                            <AvatarFallback>{candidate.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-base">{candidate.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{candidate.headline}</p>
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/employer/${candidate.postType}s/${candidate.postId}/candidates/${candidate.id}`}>View Profile</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <p>No candidates in this stage.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
};


function DashboardContent({ onPostJobOpen }: { onPostJobOpen: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeJobs: 0, totalCandidates: 0, shortlisted: 0, hired: 0 });
    const [pipelineStages, setPipelineStages] = useState(initialPipelineStages);
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<{ name: string; id: string } | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const jobsQuery = query(collection(db, 'jobs'), where("employerId", "==", user.uid));
                const internshipsQuery = query(collection(db, 'internships'), where("employerId", "==", user.uid));

                const [jobsSnapshot, internshipsSnapshot] = await Promise.all([
                    getDocs(jobsQuery).catch(error => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: "jobs", operation: 'list'}));
                        return null;
                    }), 
                    getDocs(internshipsQuery).catch(error => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: "internships", operation: 'list'}));
                        return null;
                    })
                ]);
                
                const allPosts = [
                    ...(jobsSnapshot?.docs.map(d => ({ ...d.data(), id: d.id, type: 'job' as const })) || []),
                    ...(internshipsSnapshot?.docs.map(d => ({ ...d.data(), id: d.id, type: 'internship' as const })) || [])
                ];

                const totalCandidates = allPosts.reduce((acc, post) => acc + (post.applicantCount || 0), 0);
                
                const newStats = {
                    activeJobs: allPosts.length,
                    totalCandidates: totalCandidates,
                    shortlisted: 0, // This would require querying all applications
                    hired: 0 // This would require querying all applications
                };
                setStats(newStats);
                
                // We reset the pipeline stages counts here. 
                // A full count would require fetching all applications which is expensive for a dashboard.
                // The main logic is now on the specific job pipeline page.
                setPipelineStages(initialPipelineStages.map(s => ({...s, count: 0})));


            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleStageClick = (stage: { name: string; id: string; }) => {
        // This is now disabled on dashboard as we don't fetch all applicant details.
        // The modal logic is preserved in case we want to use it elsewhere.
        // setSelectedStage(stage);
        // setIsDialogOpen(true);
    };

    const filteredCandidates = selectedStage ? allApplicants.filter(app => (app.currentStage || 'applied').toLowerCase().replace(/ /g, '_') === selectedStage.id) : [];

    const insightCards = [
        { title: 'Active Posts', value: stats.activeJobs, icon: <Briefcase className="w-6 h-6 text-orange-500" /> },
        { title: 'Total Applicants', value: stats.totalCandidates, icon: <Users className="w-6 h-6 text-green-500" /> },
        { title: 'Shortlisted', value: stats.shortlisted, icon: <Star className="w-6 h-6 text-yellow-500" /> },
        { title: 'Hired This Month', value: stats.hired, icon: <Bookmark className="w-6 h-6 text-indigo-500" /> },
    ];
    
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-semibold text-2xl md:text-3xl">Welcome, {user?.displayName || 'Employer'}!</h1>
                  <p className="text-muted-foreground">Your command center for smart hiring. Let's find your next great hire.</p>
                </div>
                <Button onClick={onPostJobOpen}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Post
                </Button>
              </div>
              
              <section id="quick-insights">
                 {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                       {[...Array(4)].map((_, i) => <Card key={i}><CardHeader><CardTitle className="text-sm font-medium h-5 bg-muted rounded"></CardTitle></CardHeader><CardContent><div className="h-10 bg-muted rounded"></div></CardContent></Card>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {insightCards.map((insight, index) => (
                        <Card key={index}>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                              {insight.title}
                            </CardTitle>
                            {insight.icon}
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-bold">{insight.value}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                )}
              </section>

              <div className="grid gap-6 md:grid-cols-1">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle>Hiring Pipeline Overview</CardTitle>
                            <CardDescription>A summary of your candidate progression stages across all posts. Data per stage is now available in the 'My Postings' section.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                     <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                      {loading ? (
                          [...Array(8)].map((_, i) => <Card key={i} className="p-4 h-28 bg-muted animate-pulse"></Card>)
                      ) : (
                          pipelineStages.map((stage) => (
                            <Card 
                                key={stage.id} 
                                className={`flex flex-col justify-between p-4 transition-all duration-300 border-0 ${stage.color} opacity-60`}
                            >
                               <div className="text-center">
                                 <p className={`text-5xl font-extrabold ${stage.textColor}`}>-</p>
                                 <h3 className={`font-semibold mt-2 text-sm ${stage.textColor}`}>{stage.name}</h3>
                               </div>
                            </Card>
                          ))
                      )}
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
                {selectedStage && (
                  <CandidateStageDialog
                      isOpen={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                      stageName={selectedStage.name}
                      candidates={filteredCandidates}
                      postType="job" // This might need to be dynamic if showing mixed applicants
                  />
              )}
            </main>
    )
}

export default function EmployerDashboardPage({ children }: { children?: React.ReactNode }) {
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [jobDetailsForPipeline, setJobDetailsForPipeline] = useState<any>(null);
  const [postTypeForPipeline, setPostTypeForPipeline] = useState<'job' | 'internship'>('job');


  const handlePipelineOpen = (details: any, postType: 'job' | 'internship') => {
    setJobDetailsForPipeline(details);
    setPostTypeForPipeline(postType);
    setIsPostJobOpen(false);
    setIsCreatePipelineOpen(true);
  }

  return (
    <>
    <div className="min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40 overflow-x-hidden">
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
                        <AvatarFallback>E</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            {children ? children : <DashboardContent onPostJobOpen={() => setIsPostJobOpen(true)} />}
        </div>
    </div>
    <PostJobDialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen} onPipelineOpen={handlePipelineOpen} />
    <CreatePipelineDialog open={isCreatePipelineOpen} onOpenChange={setIsCreatePipelineOpen} jobDetails={jobDetailsForPipeline} postType={postTypeForPipeline} />
    </>
  );
}
