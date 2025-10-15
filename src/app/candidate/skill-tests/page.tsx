
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
import { collection, onSnapshot, DocumentData, Timestamp, query, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { Loader2, TestTube2, Building, FileText, Download, Upload } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ApplicationForTest extends DocumentData {
  id: string; // application id
  postTitle: string;
  companyName: string;
  postId: string;
  postType: 'job' | 'internship';
  testType?: 'ai' | 'traditional';
  testFileUrl?: string; // For traditional tests
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [skillTests, setSkillTests] = useState<ApplicationForTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionFiles, setSubmissionFiles] = useState<{[key: string]: File | null}>({});

  useEffect(() => {
    if (user) {
      setLoading(true);
      const appsRef = collection(db, 'applications');
      // Query for applications that are in the 'Skill Test' stage for the current candidate
      const q = query(appsRef, where('candidateId', '==', user.uid), where('status', '==', 'Skill Test'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationForTest));

        if (appsData.length === 0) {
            setSkillTests([]);
            setLoading(false);
            return;
        }

        const testsWithDetails: ApplicationForTest[] = [];

        for (const appData of appsData) {
            const postRef = doc(db, appData.postType === 'job' ? 'jobs' : 'internships', appData.postId);
            try {
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const postData = postSnap.data();
                    const pipeline = postData.pipeline || [];
                    const skillTestStage = pipeline.find((p: any) => p.stage === 'skill_test');
                    
                    const testType = skillTestStage?.type;
                    // In a real app, this URL would come from the employer's upload to Firebase Storage.
                    const testFileUrl = testType === 'traditional' ? '#' : undefined; // Placeholder

                    testsWithDetails.push({
                        ...appData,
                        testType: testType,
                        testFileUrl: testFileUrl,
                    });
                } else {
                   testsWithDetails.push(appData); // Add app even if post is not found
                }
            } catch (e) {
                console.error(`Could not fetch post details for app ${appData.id}`, e);
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                   path: postRef.path,
                   operation: 'get',
                }));
                testsWithDetails.push(appData); // Add app even on error
            }
        }
        
        setSkillTests(testsWithDetails);
        setLoading(false);

      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `applications where candidateId == ${user.uid} and status == 'Skill Test'`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleFileChange = (testId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFiles(prev => ({...prev, [testId]: e.target.files![0]}));
    }
  }

  const handleSubmitTraditionalTest = (testId: string) => {
      const file = submissionFiles[testId];
      if (!file) {
          alert("Please select a file to submit.");
          return;
      }
      // In a real app, you would upload this file to Firebase Storage
      // and then update the application/skillTest status.
      alert(`Submitting ${file.name} for test ${testId}.`);
  }

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
          ) : skillTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No skill tests</h3>
              <p className="mt-1 text-sm text-gray-500">You have not been assigned any skill tests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
                {skillTests.map((test) => (
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
                                <Badge variant="default">Pending</Badge>
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
                                    <Button asChild>
                                        <Link href={`/candidate/skill-tests/${test.postId}`}>Start Test</Link>
                                    </Button>
                                </div>
                            )}

                             {test.testType === 'traditional' && (
                                <div className="p-4 border rounded-lg bg-secondary/50 space-y-4">
                                   <div>
                                        <h4 className="font-semibold mb-2">Step 1: Download Test</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Download the test file provided by the employer.</p>
                                        <Button asChild variant="outline">
                                            <a href={test.testFileUrl} download>
                                                <Download className="mr-2"/> Download Test File
                                            </a>
                                        </Button>
                                   </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Step 2: Submit Your Work</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Upload your completed test file (PDF, DOC, or code).</p>
                                        <div className="flex items-center gap-2">
                                            <Input id={`file-upload-${test.id}`} type="file" className="max-w-xs" onChange={(e) => handleFileChange(test.id, e)}/>
                                            <Button onClick={() => handleSubmitTraditionalTest(test.id)} disabled={!submissionFiles[test.id]}>
                                                <Upload className="mr-2"/> Submit
                                            </Button>
                                        </div>
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
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
