
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Loader2, GraduationCap, TestTube2, FilePlus, Eye, CheckCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import EmployerLayout from '../layout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FullReport, ReportDialog } from '@/components/employer/report-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

type Post = DocumentData & { 
    id: string; 
    type: 'Job' | 'Internship'; 
    title: string, 
    createdAt: Timestamp,
    pipeline: { stage: string, type?: string }[];
};

type ReportWithCandidate = FullReport & {
  candidateName: string;
  candidateId: string;
  postType: 'job' | 'internship';
};


const ViewSubmissionsDialog = ({ 
    isOpen, 
    onOpenChange, 
    post 
}: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void;
    post: Post | null;
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reports, setReports] = useState<ReportWithCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        if (isOpen && post && user) {
            const fetchReports = async () => {
                setLoading(true);
                try {
                    const reportsQuery = query(collection(db, 'skillTestReports'), where('postId', '==', post.id), where('employerId', '==', user.uid));
                    const reportsSnapshot = await getDocs(reportsQuery);

                    if (reportsSnapshot.empty) {
                        setReports([]);
                        setLoading(false);
                        return;
                    }

                    const reportsData = reportsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as FullReport[];
                    
                    const reportsWithDetails: ReportWithCandidate[] = [];
                    for (const report of reportsData) {
                        let submissionData: { submission: any[] } = { submission: [] };
                        if (report.submissionId) {
                            const submissionRef = doc(db, 'skillTestSubmissions', report.submissionId);
                            const submissionSnap = await getDoc(submissionRef);
                            if (submissionSnap.exists()) {
                                submissionData = submissionSnap.data() as { submission: any[] };
                            }
                        }
                        
                        const applicationQuery = query(collection(db, 'applications'), where('candidateId', '==', report.candidateId), where('postId', '==', report.postId));
                        const applicationSnap = await getDocs(applicationQuery);
                        const candidateName = applicationSnap.docs[0]?.data()?.candidateName || 'Unknown Candidate';

                        reportsWithDetails.push({
                            ...report,
                            submission: submissionData.submission,
                            candidateName,
                            candidateId: report.candidateId,
                            postType: post.type.toLowerCase() as 'job' | 'internship',
                        });
                    }
                    
                    setReports(reportsWithDetails.sort((a,b) => b.generatedAt.toMillis() - a.generatedAt.toMillis()));

                } catch (error) {
                    console.error("Error fetching skill test reports:", error);
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `skillTestReports for post ${post.id}`,
                        operation: 'list',
                    }));
                } finally {
                    setLoading(false);
                }
            };
            fetchReports();
        }
    }, [isOpen, post, user]);

    const handleViewReport = (report: ReportWithCandidate) => {
        setSelectedReport(report);
        setIsReportOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submissions for "{post?.title}"</DialogTitle>
                        <DialogDescription>Review reports for candidates who have completed the skill test.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        {loading ? (
                             <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : reports.length === 0 ? (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>No skill tests have been submitted for this post yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <Card key={report.id}>
                                        <CardContent className="p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{report.candidateName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                     <Link href={`/employer/jobs/${report.postId}/candidates/${report.candidateId}`} className="font-semibold hover:underline">{report.candidateName}</Link>
                                                    <p className="text-sm text-muted-foreground">Score: {report.score}/100</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleViewReport(report)}>
                                                <Eye className="mr-2 h-4 w-4"/> View Report
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <ReportDialog report={selectedReport} open={isReportOpen} onOpenChange={setIsReportOpen} />
        </>
    )
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternships, setShowInternships] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      };
      
      setLoading(true);
      
      try {
        const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.uid));
        const internshipsQuery = query(collection(db, "internships"), where("employerId", "==", user.uid));
        
        const [jobsSnapshot, internshipsSnapshot] = await Promise.all([
          getDocs(jobsQuery).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'jobs', operation: 'list', requestResourceData: { employerId: user.uid } }));
            return null;
          }),
          getDocs(internshipsQuery).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'internships', operation: 'list', requestResourceData: { employerId: user.uid } }));
            return null;
          })
        ]);

        const jobsData = jobsSnapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Job' } as Post)) || [];
        const internshipsData = internshipsSnapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Internship' } as Post)) || [];
        
        let allPosts = [...jobsData, ...internshipsData];
        setPosts(allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));

      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  const handleViewTestsClick = (post: Post) => {
    setSelectedPost(post);
    setIsSubmissionsOpen(true);
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => showInternships ? post.type === 'Internship' : post.type === 'Job');
  }, [posts, showInternships]);
  
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const getTestInfo = (pipeline: { stage: string, type?: string }[]) => {
      const skillTestStage = pipeline?.find(p => p.stage === 'skill_test');
      if (!skillTestStage || !skillTestStage.type) return {
          badge: <Badge variant="outline">Not Set</Badge>,
          type: 'none'
      };
      
      const type = skillTestStage.type;

      if (type === 'ai') {
          return {
              badge: <Badge>AI Test</Badge>,
              type: 'ai'
          }
      }
      if (type === 'traditional') {
          return {
              badge: <Badge variant="secondary">Traditional</Badge>,
              type: 'traditional'
          }
      }
      return {
          badge: <Badge variant="outline">{type}</Badge>,
          type: 'none'
      }
  }

  const PageContent = (
     <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><TestTube2 className="w-8 h-8" /> Skill Tests</h1>
              <CardDescription>Create and manage skill assessments for your job and internship postings.</CardDescription>
          </div>
           <div className="flex items-center space-x-2">
              <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
                <Briefcase className={!showInternships ? 'text-primary' : ''}/>
                <span>Jobs</span>
              </Label>
              <Switch 
                id="post-type-toggle"
                checked={showInternships}
                onCheckedChange={setShowInternships}
              />
              <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className={showInternships ? 'text-primary' : ''}/>
                <span>Internships</span>
              </Label>
            </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Your {showInternships ? 'Internship' : 'Job'} Postings</CardTitle>
            <CardDescription>Select a posting to create or view its skill tests.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>You haven't created any {showInternships ? 'internships' : 'job'} postings yet.</p>
                     <Button variant="link" asChild>
                        <Link href="/employer/jobs">Go to My Postings</Link>
                     </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Test Type</TableHead>
                            <TableHead>Created On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.map(post => {
                            const testInfo = getTestInfo(post.pipeline);
                            return (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.type === 'Job' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                                          {post.type === 'Job' ? <Briefcase className="w-3 h-3"/> : <GraduationCap className="w-3 h-3"/>}
                                          {post.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{testInfo.badge}</TableCell>
                                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                         <Button variant="outline" size="sm" onClick={() => handleViewTestsClick(post)}>
                                              <Eye className="mr-2 h-3 w-3"/>
                                              View Tests
                                        </Button>
                                        {testInfo.type === 'ai' ? (
                                            <Button size="sm" disabled>
                                                <CheckCircle className="mr-2 h-3 w-3"/>
                                                AI Test Enabled
                                            </Button>
                                        ) : testInfo.type === 'traditional' ? (
                                            <Button size="sm">
                                                <Upload className="mr-2 h-3 w-3"/>
                                                Upload Test
                                            </Button>
                                        ) : (
                                            <Button asChild size="sm">
                                                <Link href={`/employer/skill-tests/${post.id}/create`}>
                                                <FilePlus className="mr-2 h-3 w-3"/>
                                                Create Test
                                                </Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      <ViewSubmissionsDialog 
        isOpen={isSubmissionsOpen}
        onOpenChange={setIsSubmissionsOpen}
        post={selectedPost}
      />
    </div>
  );

  return <EmployerLayout>{PageContent}</EmployerLayout>
}

    