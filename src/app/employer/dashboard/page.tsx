
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, Star, Bookmark, TestTube2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useEmployerLayout } from '../layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


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


export default function EmployerDashboardPage() {
    const { user } = useAuth();
    const { setIsPostJobOpen } = useEmployerLayout();
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
                  <h1 className="text-2xl font-semibold md:text-3xl">Welcome, {user?.displayName || 'Employer'}!</h1>
                  <p className="text-muted-foreground">Your command center for smart hiring. Let's find your next great hire.</p>
                </div>
                <Button onClick={() => setIsPostJobOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Post
                </Button>
              </div>
              
              <section id="quick-insights">
                 {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                       {[...Array(4)].map((_, i) => <Card key={i}><CardHeader><CardTitle className="h-5 rounded bg-muted text-sm font-medium"></CardTitle></CardHeader><CardContent><div className="h-10 rounded bg-muted"></div></CardContent></Card>)}
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
                          [...Array(8)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted p-4"></Card>)
                      ) : (
                          pipelineStages.map((stage) => (
                            <Card 
                                key={stage.id} 
                                className={`flex flex-col justify-between p-4 transition-all duration-300 border-0 ${stage.color} opacity-60`}
                            >
                               <div className="text-center">
                                 <p className={`text-5xl font-extrabold ${stage.textColor}`}>-</p>
                                 <h3 className={`mt-2 text-sm font-semibold ${stage.textColor}`}>{stage.name}</h3>
                               </div>
                            </Card>
                          ))
                      )}
                    </CardContent>
                  </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 border-dashed border-blue-200 dark:border-blue-900">
                            <div className="mb-4 rounded-full bg-blue-100 p-4 dark:bg-blue-900/50">
                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Explore Campus Talent</h3>
                            <p className="mb-4 text-center text-sm text-muted-foreground">Discover promising new talent from top colleges across the country.</p>
                            <Button variant="outline" asChild>
                                <Link href="#">View Campus Pool</Link>
                            </Button>
                        </Card>
                         <Card className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 border-dashed border-green-200 dark:border-green-900">
                            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/50">
                                <TestTube2 className="h-8 w-8 text-green-600 dark:text-green-400"/>
                            </div>
                            <h3 className="mb-2 text-xl font-bold">Manage AI Skill Tests</h3>
                            <p className="mb-4 text-center text-sm text-muted-foreground">Create, assign, and review AI-powered skill assessments for your candidates.</p>
                            <Button variant="outline" asChild>
                                <Link href="#">Go to Skill Tests</Link>
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
