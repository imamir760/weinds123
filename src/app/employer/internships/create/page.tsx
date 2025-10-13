'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateInternshipPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Post a New Internship</CardTitle>
          <CardDescription>Fill in the details for your new internship opportunity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="internship-title">Internship Title</Label>
                <Input id="internship-title" placeholder="e.g., Frontend Development Intern" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="internship-description">Description</Label>
                <Textarea id="internship-description" placeholder="Describe the internship role and responsibilities." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="stipend">Stipend (per month)</Label>
                    <Input id="stipend" placeholder="e.g., 15000" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="duration">Duration (in months)</Label>
                    <Input id="duration" placeholder="e.g., 3" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="skills">Required Skills</Label>
                <Input id="skills" placeholder="e.g., React, Figma, Communication" />
                <p className="text-xs text-muted-foreground">Comma-separated skills</p>
            </div>
            <div className="flex justify-end">
                <Button>Post Internship</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
