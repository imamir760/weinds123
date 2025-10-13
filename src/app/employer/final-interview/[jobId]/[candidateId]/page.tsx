'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';


export default function FinalInterviewCandidatePage({ params }: { params: { jobId: string, candidateId: string } }) {
  return (
     <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
         <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/final-interview"><ArrowLeft className="mr-2" /> Back to Interviews</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Final Interview Details</CardTitle>
                <CardDescription>Job: {params.jobId}, Candidate: {params.candidateId}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Details about the final interview will be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
