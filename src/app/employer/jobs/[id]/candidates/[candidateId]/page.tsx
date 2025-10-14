'use client';
import { use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CandidateDetailsPage({ params }: { params: Promise<{ id: string; candidateId: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href={`/employer/jobs/${resolvedParams.id}`}><ArrowLeft className="mr-2" /> Back to Pipeline</Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>Viewing candidate {resolvedParams.candidateId} for job {resolvedParams.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Full candidate profile details, including resume, scores, and interview history, will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
