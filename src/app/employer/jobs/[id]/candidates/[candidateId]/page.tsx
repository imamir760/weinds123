'use client';
import { use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CandidateDetailsPage({ params }: { params: { id: string; candidateId: string } }) {
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href={`/employer/jobs/${params.id}`}><ArrowLeft className="mr-2" /> Back to Applicants</Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>Viewing candidate {params.candidateId} for job {params.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Full candidate profile details, including resume, scores, and interview history, will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
