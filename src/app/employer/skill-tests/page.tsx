
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Loader2, GraduationCap, TestTube2, Eye, CheckCircle, Upload, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth, User } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp, doc, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import EmployerLayout from '../layout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FullReport, ReportDialog } from '@/components/employer/report-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { uploadTraditionalTest } from '@/lib/test-actions';
import { Progress } from '@/components/ui/progress';


type Post = DocumentData & { 
    id: string; 
    type: 'Job' | 'Internship'; 
    title: string, 
    createdAt: Timestamp,
    pipeline: { stage: string, type?: string, testFileUrl?: string }[];
};

type TraditionalTest = {
    id: string;
    postId: string;
    employerId: string;
    testFileUrl: string;
}


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
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        if (isOpen && post && user) {
            const fetchSubmissionsAndReports = async () => {
                setLoading(true);
                try {
                    const submissionsQuery = query(collection(db, 'skillTestSubmissions'), where('postId', '==', post.id), where('employerId', '==', user.uid));
                    const submissionsSnapshot = await getDocs(submissionsQuery);

                    if (submissionsSnapshot.empty) {
                        setSubmissions([]);
                        setLoading(false);
                        return;
                    }
                    
                    const submissionDocs = submissionsSnapshot.docs.map(d => ({...d.data(), id: d.id}));

                    const populatedSubmissions = [];
                    for (const sub of submissionDocs) {
                        const applicationQuery = query(collection(db, 'applications'), where('candidateId', '==', sub.candidateId), where('postId', '==', sub.postId));
                        const applicationSnap = await getDocs(applicationQuery);
                        const candidateName = applicationSnap.docs[0]?.data()?.candidateName || sub.candidateId;

                        let reportData = null;
                        if (sub.testType === 'ai') {
                             const reportQuery = query(collection(db, 'skillTestReports'), where('submissionId', '==', sub.id));
                             const reportSnapshot = await getDocs(reportQuery);
                             if (!reportSnapshot.empty) {
                                reportData = { ...reportSnapshot.docs[0].data(), id: reportSnapshot.docs[0].id, submission: sub.submission } as FullReport;
                             }
                        }
                        populatedSubmissions.push({ ...sub, candidateName, report: reportData });
                    }
                    
                    setSubmissions(populatedSubmissions);
                } catch (error) {
                    console.error("Error fetching skill test submissions:", error);
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: `skillTestSubmissions for post ${post.id}`,
                        operation: 'list',
                    }));
                } finally {
                    setLoading(false);
                }
            };
            fetchSubmissionsAndReports();
        }
    }, [isOpen, post, user]);

    const handleViewReport = (report: FullReport) => {
        setSelectedReport(report);
        setIsReportOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Submissions for "{post?.title}"</DialogTitle>
                        <DialogDescription>Review submissions for candidates who have completed the skill test.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        {loading ? (
                             <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : submissions.length === 0 ? (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>No skill tests have been submitted for this post yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map((sub) => (
                                    <Card key={sub.id}>
                                        <CardContent className="p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{sub.candidateName?.charAt(0) || 'C'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                     <Link href={`/employer/${sub.postType === 'job' ? 'jobs' : 'internships'}/${post?.id}/candidates/${sub.candidateId}`} className="font-semibold hover:underline">{sub.candidateName}</Link>
                                                     {sub.report?.score !== undefined && <p className="text-sm text-muted-foreground">AI Score: {sub.report.score}/100</p>}
                                                </div>
                                            </div>
                                            {sub.report ? (
                                                <Button size="sm" variant="outline" onClick={() => handleViewReport(sub.report)}>
                                                    <Eye className="mr-2 h-4 w-4"/> View Report
                                                </Button>
                                            ) : sub.submissionFileUrl ? (
                                                 <Button asChild size="sm" variant="outline">
                                                    <a href={sub.submissionFileUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileDown className="mr-2 h-4 w-4"/> Download Submission
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
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

const UploadTestDialog = ({ post, open, onOpenChange, onUploadComplete }: { post: Post | null, open: boolean, onOpenChange: (open: boolean) => void, onUploadComplete: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    const handleUpload = async () => {
        if (!file || !post || !user) {
            toast({ title: "Please select a file.", variant: "destructive" });
            return;
        }
        setUploading(true);
        setProgress(0);
        try {
            await uploadTraditionalTest(post.id, user.uid, file, setProgress);
            toast({ title: "Test uploaded successfully!" });
            onUploadComplete(); // Refresh parent component
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Traditional Test</DialogTitle>
                    <DialogDescription>
                        Upload the test file for the post: <span className="font-semibold">{post?.title}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input type="file" onChange={handleFileChange} disabled={uploading}/>
                    {uploading && <Progress value={progress} className="w-full" />}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || uploading}>
                        {uploading ? <Loader2 className="mr-2 animate-spin"/> : <Upload className="mr-2"/>}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function SkillTestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternships, setShowInternships] = useState(false);
  
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [traditionalTests, setTraditionalTests] = useState<TraditionalTest[]>([]);
  
  const fetchPosts = async (currentUser: User) => {
    setLoading(true);
    try {
        const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", currentUser.uid));
        const internshipsQuery = query(collection(db, "internships"), where("employerId", "==", currentUser.uid));
        const testsQuery = query(collection(db, 'traditionalTests'), where('employerId', '==', currentUser.uid));

        const [jobsSnapshot, internshipsSnapshot, testsSnapshot] = await Promise.all([
            getDocs(jobsQuery),
            getDocs(internshipsQuery),
            getDocs(testsQuery)
        ]);

        const jobsData = jobsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Job' } as Post));
        const internshipsData = internshipsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Internship' } as Post));
        const testsData = testsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TraditionalTest));

        setPosts([...jobsData, ...internshipsData].sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        setTraditionalTests(testsData);

    } catch (e) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'jobs, internships, or traditionalTests', operation: 'list'}));
    } finally {
        setLoading(false);
    }
  }


  useEffect(() => {
    if (user) {
      fetchPosts(user);
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleViewSubmissionsClick = (post: Post) => {
    setSelectedPost(post);
    setIsSubmissionsOpen(true);
  }
  
  const handleUploadClick = (post: Post) => {
    setSelectedPost(post);
    setIsUploadOpen(true);
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => showInternships ? post.type === 'Internship' : post.type === 'Job');
  }, [posts, showInternships]);
  
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const getTestInfo = (post: Post) => {
      const skillTestStage = post.pipeline?.find(p => p.stage === 'skill_test');

      if (!skillTestStage || !skillTestStage.type) return {
          badge: <Badge variant="outline">Not Set</Badge>,
          type: 'none',
          uploaded: false
      };
      
      const type = skillTestStage.type;
      const uploaded = traditionalTests.some(t => t.postId === post.id);

      if (type === 'ai') {
          return {
              badge: <Badge>AI Test</Badge>,
              type: 'ai',
              uploaded: true // AI tests are always "ready"
          }
      }
      if (type === 'traditional') {
          return {
              badge: <Badge variant="secondary">Traditional</Badge>,
              type: 'traditional',
              uploaded: uploaded,
          }
      }
      return {
          badge: <Badge variant="outline">{type}</Badge>,
          type: 'none',
          uploaded: false,
      }
  }

  const PageContent = (
     <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                  <TestTube2 className="w-6 h-6"/>
                  <div>
                      <CardTitle>Skill Tests</CardTitle>
                      <CardDescription>Create and manage skill assessments for your job and internship postings.</CardDescription>
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className={!showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                  <span className={!showInternships ? 'text-primary font-semibold' : 'text-muted-foreground'}>Jobs</span>
                </Label>
                <Switch 
                  id="post-type-toggle"
                  checked={showInternships}
                  onCheckedChange={setShowInternships}
                />
                <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
                  <GraduationCap className={showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                   <span className={showInternships ? 'text-primary font-semibold' : 'text-muted-foreground'}>Internships</span>
                </Label>
              </div>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>You haven't created any {showInternships ? 'internships' : 'job'} postings with skill tests yet.</p>
                     <Button variant="link" asChild>
                        <Link href="/employer/jobs">Go to My Postings to configure a pipeline</Link>
                     </Button>
                </div>
            ) : (
                <div className="overflow-x-auto">
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
                                const testInfo = getTestInfo(post);
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
                                            <Button variant="outline" size="sm" onClick={() => handleViewSubmissionsClick(post)}>
                                                <Eye className="mr-2 h-3 w-3"/>
                                                Submissions
                                            </Button>
                                            {testInfo.type === 'ai' && (
                                                <Button size="sm" disabled>
                                                    <CheckCircle className="mr-2 h-3 w-3"/>
                                                    AI Enabled
                                                </Button>
                                            )}
                                            {testInfo.type === 'traditional' && (
                                                testInfo.uploaded ? (
                                                     <Button size="sm" variant="secondary" disabled>
                                                        <CheckCircle className="mr-2 h-3 w-3"/>
                                                        Test Uploaded
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" onClick={() => handleUploadClick(post)}>
                                                        <Upload className="mr-2 h-3 w-3" />
                                                        Upload Test
                                                    </Button>
                                                )
                                            )}
                                            {testInfo.type === 'none' && (
                                                <Button asChild size="sm" variant="ghost" disabled>
                                                    <span className="text-muted-foreground">Setup in Pipeline</span>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
      <ViewSubmissionsDialog 
        isOpen={isSubmissionsOpen}
        onOpenChange={setIsSubmissionsOpen}
        post={selectedPost}
      />
      <UploadTestDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        post={selectedPost}
        onUploadComplete={() => {
            if(user) fetchPosts(user);
        }}
      />
    </div>
  );

  return <EmployerLayout>{PageContent}</EmployerLayout>
}
