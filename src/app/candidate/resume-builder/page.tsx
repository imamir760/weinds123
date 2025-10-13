'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { reformatResume } from '@/ai/flows';
import { Loader2, FileText, Download } from 'lucide-react';
import CandidateDashboardLayout from '../dashboard/page';

export default function ResumeBuilderPage() {
  const [rawText, setRawText] = useState('');
  const [formattedResume, setFormattedResume] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReformat = async (templateName: string) => {
    if (!rawText) return;
    setLoading(true);
    setFormattedResume('');
    try {
      const result = await reformatResume({ rawText, templateName });
      setFormattedResume(result.formattedResume);
    } catch (error) {
      console.error('Failed to reformat resume:', error);
      // You can add a toast notification here to inform the user
    } finally {
      setLoading(false);
    }
  };

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline">AI Resume Builder</h1>
        <p className="text-xl text-muted-foreground mt-2">Paste your raw resume text and let our AI create a professional document.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Paste Your Resume Text</CardTitle>
            <CardDescription>Copy and paste your resume content here, no formatting needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={20}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="John Doe\nSoftware Engineer...\n\nExperience\nCompany X..."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Choose a Template</CardTitle>
            <CardDescription>Our AI will reformat your text into one of these professional designs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => handleReformat('Classic')} disabled={loading || !rawText}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Classic Professional
            </Button>
            <Button className="w-full" onClick={() => handleReformat('Modern')} disabled={loading || !rawText}>
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Modern Minimalist
            </Button>
             <Button className="w-full" onClick={() => handleReformat('Creative')} disabled={loading || !rawText}>
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Creative ATS-Friendly
            </Button>
          </CardContent>

          {formattedResume && (
              <CardContent>
                <CardTitle className="mb-4">3. Your Formatted Resume</CardTitle>
                <div className="p-4 border rounded-md bg-secondary h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{formattedResume}</pre>
                </div>
                 <Button className="w-full mt-4">
                    <Download className="mr-2"/>
                    Download as PDF
                </Button>
              </CardContent>
          )}
        </Card>
      </div>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
