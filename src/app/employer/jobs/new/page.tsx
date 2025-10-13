'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateJobDescription } from '@/ai/flows/generate-job-description';
import { Loader2 } from 'lucide-react';

export default function NewJobPage() {
  const [unstructuredText, setUnstructuredText] = useState('');
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!unstructuredText) return;
    setLoading(true);
    try {
      const result = await generateJobDescription({ text: unstructuredText });
      setJobDetails(result);
    } catch (error) {
      console.error('Failed to generate job description:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold font-headline">
              Create a New Job Post
            </CardTitle>
            <CardDescription>
              Describe the job in your own words, and let our AI structure it for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-text">Job Description Text</Label>
              <Textarea
                id="job-text"
                rows={8}
                value={unstructuredText}
                onChange={e => setUnstructuredText(e.target.value)}
                placeholder="e.g., 'Looking for a senior frontend dev with 5 years of React experience to build our new dashboard. Must know TypeScript. Full-time remote position...'"
              />
              <p className="text-xs text-muted-foreground">
                Include details like job title, skills, responsibilities, salary, location, etc.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !unstructuredText}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Generate Job Post
            </Button>
          </CardContent>
        </Card>

        {jobDetails && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated Job Details</CardTitle>
              <CardDescription>
                Review and edit the generated information before posting.
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
              <div className="flex justify-end">
                <Button>Post Job</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
