'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../../../dashboard/page';

const report = {
  jobTitle: 'Product Manager',
  company: 'Innovate LLC',
  semanticScore: 88,
  strengths: [
    'Strong alignment with product vision.',
    'Clear and concise communication.',
    'Demonstrated experience in agile methodologies.',
  ],
  areasForImprovement: [
    'Could provide more specific metrics for past project successes.',
    'Slight hesitation on market analysis questions.',
  ],
  recommendation: 'Strongly Recommended. The candidate shows excellent potential and aligns well with the core requirements of the role.',
};

export default function InterviewReportPage({ params }: { params: { jobId: string } }) {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/candidate/ai-interviews"><ArrowLeft className="mr-2" /> Back to Interviews</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">AI Interview Report</CardTitle>
            <CardDescription>For {report.jobTitle} at {report.company}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
                <p className="text-muted-foreground">Overall Semantic Score</p>
                <p className="text-6xl font-bold text-primary">{report.semanticScore}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center"><Star className="w-5 h-5 mr-2 text-amber-500" /> Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {report.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
             <Card className="bg-secondary">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><MessageSquare className="w-5 h-5 mr-2" /> AI's Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">"{report.recommendation}"</p>
                </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
