
'use client';

import { useState, useEffect, use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CandidateDashboardLayout from '../../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, DocumentData, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Clock, Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { generateSkillTest, GenerateSkillTestOutput } from '@/ai/dev';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

type Question = GenerateSkillTestOutput['questions'][0];

export default function StartSkillTestPage({ params }: { params: { postId: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.postId;

  const [test, setTest] = useState<GenerateSkillTestOutput | null>(null);
  const [testDetails, setTestDetails] = useState<{title: string, companyName: string, duration: number, postType: 'job' | 'internship', employerId: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user && postId) {
      const fetchAndGenerateTest = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Find the application to get postType
            const appQuery = query(collection(db, 'applications'), where('postId', '==', postId), where('candidateId', '==', user.uid));
            const appSnap = await getDocs(appQuery);
            if (appSnap.empty) throw new Error("Application not found.");
            const appData = appSnap.docs[0].data();
            const postType = appData.postType as 'job' | 'internship';

            // 2. Fetch Post and Candidate data concurrently
            const postRef = doc(db, postType === 'job' ? 'jobs' : 'internships', postId);
            const candidateRef = doc(db, 'candidates', user.uid);
            
            const [postSnap, candidateSnap] = await Promise.all([
                getDoc(postRef).catch(e => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postRef.path, operation: 'get'}));
                    throw new Error("Could not fetch post details.");
                }),
                getDoc(candidateRef).catch(e => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: candidateRef.path, operation: 'get'}));
                    throw new Error("Could not fetch candidate profile.");
                })
            ]);

            if (!postSnap.exists()) throw new Error("Job or Internship not found.");
            if (!candidateSnap.exists()) throw new Error("Candidate profile not found.");

            const postData = postSnap.data();
            const candidateData = candidateSnap.data();
            
            setTestDetails({
                title: postData.title,
                companyName: postData.companyName,
                duration: 60, // Default to 60 mins
                postType: postType,
                employerId: postData.employerId
            });
            setTimeLeft(60 * 60); // 60 minutes in seconds

            const jobDescription = `
                Title: ${postData.title}\n
                Responsibilities: ${postData.responsibilities}\n
                Required Skills: ${postData.skills}
            `;
            
            const generatedTest = await generateSkillTest({ jobDescription, candidateSkills: candidateData.skills || [] });
            
            if (!generatedTest || !generatedTest.questions) {
              throw new Error("An unexpected response was received from the server.");
            }
            
            setTest(generatedTest);
            setAnswers(new Array(generatedTest.questions.length).fill(undefined));

        } catch (err: any) {
          setError(err.message || "An unknown error occurred.");
        } finally {
          setLoading(false);
        }
      };

      fetchAndGenerateTest();
    }
  }, [user, postId]);
  
  useEffect(() => {
    if (timeLeft > 0 && test && !isSubmitting) {
      const timer = setTimeout(() => {
        if (timeLeft === 1) {
            handleSubmit();
        }
        setTimeLeft(timeLeft - 1)
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, test, isSubmitting]);

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user || !test || !testDetails) return;
    setIsSubmitting(true);

    const submissionData = {
        candidateId: user.uid,
        postId: postId,
        postType: testDetails.postType,
        employerId: testDetails.employerId,
        submittedAt: serverTimestamp(),
        submission: test.questions.map((q, index) => ({
            questionText: q.questionText,
            candidateAnswer: answers[index] || '',
            correctAnswer: q.correctAnswer
        }))
    };

    try {
        await addDoc(collection(db, 'skillTestSubmissions'), submissionData);
        toast({
            title: "Test Submitted!",
            description: "Your responses have been recorded. You will be notified of the results.",
        });
        router.push('/candidate/skill-tests');

    } catch(serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: '/skillTestSubmissions',
            operation: 'create',
            requestResourceData: submissionData
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            title: "Submission Failed",
            description: "There was an error submitting your test. Please try again.",
            variant: "destructive"
        });
        setIsSubmitting(false);
    }
  }

  const currentQuestion = test?.questions[currentQuestionIndex];
  const progress = test ? ((currentQuestionIndex + 1) / test.questions.length) * 100 : 0;

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your personalized skill test...</p>
          </CardContent>
        </Card>
      ) : error || !currentQuestion ? (
         <Card className="max-w-4xl mx-auto">
          <CardContent className="h-96 flex flex-col items-center justify-center text-center">
             <AlertCircle className="w-12 h-12 text-destructive mb-4" />
             <h3 className="text-xl font-semibold text-destructive">Could not generate test</h3>
            <p className="text-muted-foreground mt-2">{error || "An unknown error occurred."}</p>
             <Button asChild variant="outline" className="mt-6">
                <Link href="/candidate/skill-tests">
                    <ChevronLeft className="mr-2"/> Back to Tests
                </Link>
             </Button>
          </CardContent>
        </Card>
      ) : test && testDetails ? (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                            <CardTitle className="text-2xl font-headline">{testDetails.title} Skill Test</CardTitle>
                            <CardDescription>{testDetails.companyName}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-primary p-2 border rounded-lg bg-secondary">
                            <Clock className="w-5 h-5"/>
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Progress value={progress} className="w-full h-2"/>
                    </div>
                </CardHeader>
                <CardContent className="py-6 min-h-[400px] flex flex-col">
                    <div className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-1">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                        <h2 className="text-lg font-semibold mb-6">{currentQuestion.questionText}</h2>

                        {currentQuestion.questionType === 'multiple-choice' && currentQuestion.options ? (
                            <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerChange}>
                                {currentQuestion.options.map((option, index) => (
                                    <Label key={index} htmlFor={`option-${index}`} className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-all">
                                        <RadioGroupItem value={option} id={`option-${index}`} />
                                        <span>{option}</span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        ) : (
                            <Textarea 
                                rows={8}
                                placeholder="Type your answer here..."
                                value={answers[currentQuestionIndex] || ''}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0 || isSubmitting}
                        >
                            <ChevronLeft className="mr-2"/> Previous
                        </Button>
                        
                        {currentQuestionIndex < test.questions.length - 1 ? (
                            <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={isSubmitting}>
                                Next <ChevronRight className="ml-2"/>
                            </Button>
                        ) : (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default" disabled={isSubmitting}>
                                      {isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                                      Submit Test
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will submit all your answers. You cannot go back after submitting.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      ) : null}
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
