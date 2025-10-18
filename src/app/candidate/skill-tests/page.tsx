
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData, Timestamp, query, where, doc, getDoc, updateDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, TestTube2, Building, FileText, FileBarChart2, Star, ThumbsUp, ThumbsDown, AlertTriangle, FileQuestion, CheckCircle, Upload, Download, FileDown } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EvaluateSkillTestOutput } from '@/ai/dev';
import { useToast } from '@/hooks/use-toast';
import { ReportDialog, FullReport } from '@/components/employer/report-dialog';
import { uploadFile } from '@/lib/storage-actions';

interface ApplicationForTest extends DocumentData {
  id: string; // application id
  postTitle: string;
  companyName: string;
  postId: string;
  postType: 'job' | 'internship';
  employerId: string;
  testType?: 'ai' | 'traditional';
  testFileUrl?: string; // For traditional tests
  submissionFileUrl?: string;
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skillTests, set_skillTests] = useState<ApplicationForTest[]>([]);
  const [reports, setReports] = useState<{[key: string]: FullReport}>({});
  const [loading, setLoading] = useState(true);
  const [submissionFiles, setSubmissionFiles] = useState<{[key: string]: File | null}>({});
  const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (user) {
      setLoading(true);

      const reportsQuery = query(collection(db, 'skillTestReports'), where('candidateId', '==', user.uid));
      const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
          const reportsData: {[key: string]: FullReport} = {};
          snapshot.docs.forEach(doc => {
              reportsData[doc.data().postId] = { id: doc.id, ...doc.data() } as FullReport;
          });
          setReports(reportsData);
      }, (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: 'skillTestReports',
              operation: 'list',
              requestResourceData: { candidateId: user.uid }
          });
          errorEmitter.emit('permission-error', permissionError);
          console.error("Could not fetch test reports.");
      });

      const appsRef = collection(db, 'applications');
      const q = query(appsRef, where('candidateId', '==', user.uid), where('status', '==', 'Skill Test'));
      const unsubscribeApps = onSnapshot(q, async (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationForTest));
        if (appsData.length === 0) {
            set_skillTests([]);
            setLoading(false);
            return;
        }

        const testsWithDetails: ApplicationForTest[] = [];
        for (const appData of appsData) {
            const postRef = doc(db, appData.postType === 'job' ? 'jobs' : 'internships', appData.postId);
            try {
                const postSnap = await getDoc(postRef);
                const submissionQuery = query(collection(db, 'skillTestSubmissions'), where('candidateId', '==', user.uid), where('postId', '==', appData.postId));
                const submissionSnap = await getDocs(submissionQuery);
                const submissionFileUrl = submissionSnap.docs[0]?.data().submissionFileUrl;

                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    const pipeline = postData.pipeline || [];
                    const skillTestStage = pipeline.find((p: any) => p.stage === 'skill_test');
                    let testFileUrl = skillTestStage?.testFileUrl;

                    // If it's a traditional test, we need to fetch the URL from the `traditionalTests` collection
                    if (skillTestStage?.type === 'traditional' && !testFileUrl) {
                        try {
                            const traditionalTestQuery = query(collection(db, 'traditionalTests'), where('postId', '==', appData.postId));
                            const traditionalTestSnap = await getDocs(traditionalTestQuery);
                            if (!traditionalTestSnap.empty) {
                                testFileUrl = traditionalTestSnap.docs[0].data().testFileUrl;
                            }
                        } catch (e) {
                             console.error(`Could not fetch traditional test file for post ${appData.postId}`, e);
                        }
                    }
                    
                    testsWithDetails.push({
                        ...appData,
                        testType: skillTestStage?.type,
                        testFileUrl: testFileUrl,
                        submissionFileUrl: submissionFileUrl
                    });
                } else {
                   testsWithDetails.push({
                        ...appData,
                        submissionFileUrl: submissionFileUrl
                   });
                }
            } catch (e) {
                console.error(`Could not fetch post details for app ${appData.id}`, e);
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'get' }));
                testsWithDetails.push(appData);
            }
        }
        set_skillTests(testsWithDetails);
        setLoading(false);
      }, (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `applications where candidateId == ${user.uid} and status == 'Skill Test'`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });

      return () => {
        unsubscribeApps();
        unsubscribeReports();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleFileChange = (testId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFiles(prev => ({...prev, [testId]: e.target.files![0]}));
    }
  }

  const handleSubmitTraditionalTest = async (test: ApplicationForTest) => {
      const file = submissionFiles[test.id];
      if (!file || !user) {
          toast({ title: "Please select a file to submit.", variant: "destructive" });
          return;
      }
      setUploading(prev => ({ ...prev, [test.id]: true }));

      try {
        const filePath = `test-submissions/${test.postId}/${user.uid}/${file.name}`;
        const fileUrl = await uploadFile(file, filePath);
        
        const submissionQuery = query(collection(db, 'skillTestSubmissions'), where('candidateId', '==', user.uid), where('postId', '==', test.postId));
        const submissionSnap = await getDocs(submissionQuery);

        if (!submissionSnap.empty) {
            const submissionDocRef = submissionSnap.docs[0].ref;
            await updateDoc(submissionDocRef, {
                submissionFileUrl: fileUrl,
                submittedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'skillTestSubmissions'), {
              candidateId: user.uid,
              postId: test.postId,
              postType: test.postType,
              employerId: test.employerId,
              testType: 'traditional',
              submissionFileUrl: fileUrl,
              submittedAt: serverTimestamp(),
            });
        }
        
        toast({ title: "Submission successful!" });
        set_skillTests(prev => prev.map(t => t.id === test.id ? {...t, submissionFileUrl: fileUrl } : t));

      } catch (error) {
        console.error("Failed to submit test", error);
        toast({ title: "Submission failed.", variant: "destructive" });
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'skillTestSubmissions',
            operation: 'update',
        }));
      } finally {
        setUploading(prev => ({ ...prev, [test.id]: false }));
      }
  }
  
  const handleViewReport = async (postId: string) => {
    const report = reports[postId];
    if (!report) {
        toast({ title: "Report not found.", variant: "destructive" });
        return;
    }

    try {
        const submissionRef = doc(db, 'skillTestSubmissions', report.submissionId);
        const submissionSnap = await getDoc(submissionRef);
        if (!submissionSnap.exists()) {
            throw new Error("Submission details could not be found.");
        }
        const submissionData = submissionSnap.data();
        
        const fullReport: FullReport = {
            ...report,
            submission: submissionData.submission,
        };

        setSelectedReport(fullReport);
        setIsReportOpen(true);
    } catch (error: any) {
        toast({ title: "Error opening report", description: error.message, variant: "destructive"});
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `skillTestSubmissions/${report.submissionId}`,
            operation: 'get',
        }));
    }
  };


  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <TestTube2 className="w-6 h-6"/>
                <div>
                    <CardTitle>My Skill Tests</CardTitle>
                    <CardDescription>Assessments sent to you by potential employers.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : set_skillTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No skill tests</h3>
              <p className="mt-1 text-sm text-gray-500">You have not been assigned any skill tests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
                {set_skillTests.map((test) => {
                    const isAiSubmitted = !!reports[test.postId];
                    const isTraditionalSubmitted = !!test.submissionFileUrl;
                    const isSubmitted = isAiSubmitted || isTraditionalSubmitted;

                    return (
                    <Card key={test.id}>
                        <CardHeader>
                            <CardTitle>{test.postTitle}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Building className="w-4 h-4" /> {test.companyName || 'A Company'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Status:</span>
                                {isSubmitted ? <Badge variant="secondary">Submitted</Badge> : <Badge variant="default">Pending</Badge>}
                                <span className="text-muted-foreground/50">|</span>
                                <span>Type:</span>
                                {test.testType ? (
                                    <Badge variant="secondary" className="capitalize">{test.testType}</Badge>
                                ) : (
                                    <Badge variant="outline">Not Specified</Badge>
                                )}
                            </div>

                            {test.testType === 'ai' && (
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <p className="text-sm text-muted-foreground mb-4">This is an AI-powered test. Your responses will be evaluated automatically. Please ensure you have a stable internet connection.</p>
                                    <div className="flex gap-2">
                                        {isAiSubmitted ? (
                                            <Button onClick={() => handleViewReport(test.postId)}>
                                                <FileBarChart2 className="mr-2"/> View Report
                                            </Button>
                                        ) : (
                                            <Button asChild>
                                                <Link href={`/candidate/skill-tests/${test.postId}`}>Start Test</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                             {test.testType === 'traditional' && (
                                <div className="p-4 border rounded-lg bg-secondary/50 space-y-4">
                                   <div>
                                        <h4 className="font-semibold mb-2">Step 1: Download Test</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Download the test file provided by the employer.</p>
                                        {test.testFileUrl ? (
                                            <Button asChild variant="outline">
                                                <a href={test.testFileUrl} download target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2"/> Download Test File
                                                </a>
                                            </Button>
                                        ) : (
                                            <p className="text-sm font-semibold text-destructive">Employer has not uploaded the test file yet.</p>
                                        )}
                                   </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Step 2: Submit Your Work</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Upload your completed test file (PDF, DOC, ZIP, etc.).</p>
                                        {isTraditionalSubmitted ? (
                                            <Button variant="outline" disabled>
                                                <CheckCircle className="mr-2 text-green-500" /> Test Submitted
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input id={`file-upload-${test.id}`} type="file" className="max-w-xs" onChange={(e) => handleFileChange(test.id, e)} disabled={!test.testFileUrl || uploading[test.id]}/>
                                                <Button onClick={() => handleSubmitTraditionalTest(test)} disabled={!test.testFileUrl || !submissionFiles[test.id] || uploading[test.id]}>
                                                    {uploading[test.id] ? <Loader2 className="mr-2 animate-spin"/> : <Upload className="mr-2"/>} Submit
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                             {!test.testType && (
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                     <p className="text-sm text-muted-foreground">The test type for this application is not specified. Please contact the employer for more details.</p>
                                </div>
                             )}

                        </CardContent>
                    </Card>
                )})}
            </div>
          )}
        </CardContent>
      </Card>
      <ReportDialog report={selectedReport} open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}

    