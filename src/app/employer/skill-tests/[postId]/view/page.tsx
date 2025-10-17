
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User, FileBarChart2 } from 'lucide-react';
import Link from 'next/link';
import EmployerLayout from '@/app/employer/layout';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { FullReport, ReportDialog } from '@/components/employer/report-dialog';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { format } from 'date-fns';

type ReportWithCandidate = FullReport & {
  candidateName: string;
  candidateId: string;
  postType: 'job' | 'internship';
};

export default function ViewSkillTestsPage({ params }: { params: { postId: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<ReportWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [postTitle, setPostTitle] = useState('');
  const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!user || !params.postId) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      setLoading(true);

      try {
        // Fetch post title
        const jobRef = doc(db, 'jobs', params.postId);
        const internRef = doc(db, 'internships', params.postId);
        let postType: 'job' | 'internship' = 'job';
        
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          setPostTitle(jobSnap.data().title);
        } else {
          const internSnap = await getDoc(internRef);
          if (internSnap.exists()) {
            setPostTitle(internSnap.data().title);
            postType = 'internship';
          }
        }


        // Fetch reports
        const reportsQuery = query(collection(db, 'skillTestReports'), where('postId', '==', params.postId), where('employerId', '==', user.uid));
        const reportsSnapshot = await getDocs(reportsQuery);

        if (reportsSnapshot.empty) {
          setReports([]);
          setLoading(false);
          return;
        }

        const reportsData = reportsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as FullReport[];
        
        const reportsWithDetails: ReportWithCandidate[] = [];
        for (const report of reportsData) {
          // Fetch submission
          let submissionData: { submission: any[] } = { submission: [] };
          if (report.submissionId) {
            const submissionRef = doc(db, 'skillTestSubmissions', report.submissionId);
            const submissionSnap = await getDoc(submissionRef);
            if (submissionSnap.exists()) {
              submissionData = submissionSnap.data() as { submission: any[] };
            }
          }
          
          // Fetch candidate name
          const applicationQuery = query(collection(db, 'applications'), where('candidateId', '==', report.candidateId), where('postId', '==', report.postId));
          const applicationSnap = await getDocs(applicationQuery);
          const candidateName = applicationSnap.docs[0]?.data()?.candidateName || 'Unknown Candidate';

          reportsWithDetails.push({
            ...report,
            submission: submissionData.submission,
            candidateName,
            candidateId: report.candidateId,
            postType: postType,
          });
        }
        
        setReports(reportsWithDetails.sort((a,b) => b.generatedAt.toMillis() - a.generatedAt.toMillis()));

      } catch (error) {
        console.error("Error fetching skill test reports:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'skillTestReports or skillTestSubmissions',
          operation: 'list',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

  }, [user, params.postId]);
  
  const handleViewReport = (report: ReportWithCandidate) => {
    setSelectedReport(report);
    setIsReportOpen(true);
  };
  
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/skill-tests"><ArrowLeft className="mr-2" /> Back to All Posts</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Skill Test Reports</CardTitle>
                <CardDescription>
                  Viewing reports for post: <span className="font-semibold">{postTitle || params.postId}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No skill tests have been submitted for this post yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                             <Card key={report.id}>
                                <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                     <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{report.candidateName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Link href={`/employer/jobs/${report.postId}/candidates/${report.candidateId}`} className="font-semibold hover:underline">{report.candidateName}</Link>
                                            <p className="text-sm text-muted-foreground">Score: {report.score}/100</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                      <p className="text-sm text-muted-foreground">
                                        Submitted on {formatDate(report.generatedAt)}
                                      </p>
                                      <Button onClick={() => handleViewReport(report)}>
                                          <FileBarChart2 className="mr-2"/> View Report
                                      </Button>
                                    </div>
                                </CardContent>
                             </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
        <ReportDialog report={selectedReport} open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
  
  return <EmployerLayout>{PageContent}</EmployerLayout>;
}
