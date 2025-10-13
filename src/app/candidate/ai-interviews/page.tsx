'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';

const interviews = [
  { jobId: 'job1', jobTitle: 'Frontend Developer', company: 'TechCorp', status: 'Pending', type: 'Conversational AI' },
  { jobId: 'job4', jobTitle: 'Product Manager', company: 'Innovate LLC', status: 'Completed', type: 'Conversational AI' },
];

export default function AiInterviewsPage() {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Interviews</CardTitle>
          <CardDescription>Your scheduled AI-powered interviews.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.jobId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
              <div>
                <h3 className="font-semibold">{interview.jobTitle}</h3>
                <p className="text-sm text-muted-foreground">{interview.company} - {interview.type}</p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                {interview.status === 'Pending' ? (
                  <Button asChild>
                    <Link href={`/candidate/ai-interviews/${interview.jobId}`}>
                      <Video className="mr-2" /> Start Interview
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href={`/candidate/ai-interviews/${interview.jobId}/report`}>
                      <BarChart2 className="mr-2" /> View Report
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
