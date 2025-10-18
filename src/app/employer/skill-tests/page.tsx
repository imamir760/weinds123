
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
import { Briefcase, Loader2, GraduationCap, TestTube2, Eye, CheckCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth, User } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp, doc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/storage-actions';

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

const DirectUploadButton = ({ post, user }: { post: Post, user: User }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !post) {
            return;
        }
        setLoading(true);
        try {
            const filePath = `skill-tests/${post.id}/${file.name}`;
            const testFileUrl = await uploadFile(file, filePath);
            
            const testData = {
                postId: post.id,
                employerId: user.uid,
                testFileUrl: testFileUrl,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'traditionalTests'), testData);
            
            toast({ title: 'Test uploaded successfully!' });

        } catch (error) {
            console.error('Upload failed', error);
            toast({
                title: 'Upload Failed',
                description: 'Could not upload the test file.',
                variant: 'destructive',
            });
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `/traditionalTests`,
                operation: 'create',
                requestResourceData: { postId: post.id, employerId: user.uid }
            }))
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    return (
        <>
            <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.zip"
            />
             <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <Upload className="mr-2 h-3 w-3"/>}
                {loading ? 'Uploading...' : 'Upload Test'}
             </Button>
        </>
    )
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [traditionalTests, setTraditionalTests] = useState<TraditionalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternships, setShowInternships] = useState(false);
  
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);

    const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.uid));
    const internshipsQuery = query(collection(db, "internships"), where("employerId", "==", user.uid));

    const fetchPosts = async () => {
        try {
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
            
            const allPosts = [...jobsData, ...internshipsData];
            setPosts(allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();

    const testsQuery = query(collection(db, 'traditionalTests'), where('employerId', '==', user.uid));
    const unsubscribeTests = onSnapshot(testsQuery, (snapshot) => {
        const testsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TraditionalTest)) || [];
        setTraditionalTests(testsData);
    }, (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'traditionalTests', operation: 'list', requestResourceData: { employerId: user.uid } }));
        return null;
    });

    return () => unsubscribeTests();
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

  const getTestInfo = (post: Post) => {
      const skillTestStage = post.pipeline?.find(p => p.stage === 'skill_test');

      if (!skillTestStage || !skillTestStage.type) return {
          badge: <Badge variant="outline">Not Set</Badge>,
          type: 'none',
          hasFile: false
      };
      
      const type = skillTestStage.type;
      const hasFile = !!traditionalTests.find(t => t.postId === post.id);

      if (type === 'ai') {
          return {
              badge: <Badge>AI Test</Badge>,
              type: 'ai',
              hasFile: false
          }
      }
      if (type === 'traditional') {
          return {
              badge: <Badge variant="secondary">Traditional</Badge>,
              type: 'traditional',
              hasFile: hasFile
          }
      }
      return {
          badge: <Badge variant="outline">{type}</Badge>,
          type: 'none',
          hasFile: false
      }
  }

  const PageContent = (
     <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2"><TestTube2 className="w-6 h-6" /> Skill Tests</CardTitle>
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
                                            <Button variant="outline" size="sm" onClick={() => handleViewTestsClick(post)}>
                                                <Eye className="mr-2 h-3 w-3"/>
                                                View Submissions
                                            </Button>
                                            {testInfo.type === 'ai' ? (
                                                <Button size="sm" disabled>
                                                    <CheckCircle className="mr-2 h-3 w-3"/>
                                                    AI Test Enabled
                                                </Button>
                                            ) : testInfo.type === 'traditional' && user ? (
                                                testInfo.hasFile ? (
                                                    <Button size="sm" disabled>
                                                        <CheckCircle className="mr-2 h-3 w-3" />
                                                        Test Uploaded
                                                    </Button>
                                                ) : (
                                                    <DirectUploadButton post={post} user={user} />
                                                )
                                            ) : (
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
    </div>
  );

  return <EmployerLayout>{PageContent}</EmployerLayout>
}
