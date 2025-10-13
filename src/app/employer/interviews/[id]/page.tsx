'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InterviewReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
         <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/interviews"><ArrowLeft className="mr-2" /> Back to Interviews</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Interview/Test Report</CardTitle>
            <CardDescription>Report for ID: {params.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A detailed report of the AI interview or skill test will be displayed here, including scores and recommendations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
