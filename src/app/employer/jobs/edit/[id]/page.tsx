'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function EditJobPage({ params }: { params: { id: string } }) {
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching job details
    setLoading(true);
    setTimeout(() => {
      setJobDetails({
        title: 'Senior Frontend Developer',
        skills: 'React, TypeScript, Next.js, Tailwind CSS',
        responsibilities: 'Build and maintain our main application. Collaborate with designers and product managers.',
        metadata: 'Full-time, Remote, $120k-$150k',
      });
      setLoading(false);
    }, 1000);
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center"><Loader2 className="mx-auto animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Edit Job Post</CardTitle>
              <CardDescription>
                Review and edit the information for job ID: {params.id}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input id="job-title" value={jobDetails.title || ''} onChange={(e) => setJobDetails({...jobDetails, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-skills">Skills</Label>
                <Input id="job-skills" value={jobDetails.skills || ''} onChange={(e) => setJobDetails({...jobDetails, skills: e.target.value})} />
                <p className="text-xs text-muted-foreground">Comma-separated skills</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-responsibilities">Responsibilities</Label>
                <Textarea id="job-responsibilities" rows={6} value={jobDetails.responsibilities || ''} onChange={(e) => setJobDetails({...jobDetails, responsibilities: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-metadata">Metadata</Label>
                <Input id="job-metadata" value={jobDetails.metadata || ''} onChange={(e) => setJobDetails({...jobDetails, metadata: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
