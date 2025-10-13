'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { generateJobDescription } from '@/ai/flows/generate-job-description';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type PostType = 'job' | 'internship';
type JobDetails = {
  title: string;
  responsibilities: string;
  skills: string;
  salary?: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';
  education?: string;
};

// Extending for internship specific fields
type InternshipDetails = JobDetails & {
    stipend?: string;
    duration?: string;
}

export function PostJobDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState<PostType>('job');
  const [unstructuredText, setUnstructuredText] = useState('');
  const [details, setDetails] = useState<JobDetails | InternshipDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const handleGenerate = async () => {
    if (!unstructuredText) return;
    setLoading(true);
    try {
      const result = await generateJobDescription({ text: unstructuredText });
      if (postType === 'internship') {
          const internshipResult: InternshipDetails = {
              ...result,
              stipend: result.salary, // Map salary to stipend
              duration: '' // Initialize duration
          }
          delete internshipResult.salary;
          setDetails(internshipResult);
      } else {
        setDetails(result);
      }
      setStep(3); // Move to the details review step
    } catch (error) {
      console.error('Failed to generate job description:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setPostType('job');
    setUnstructuredText('');
    setDetails(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>
                What type of position are you looking to fill?
              </DialogDescription>
            </DialogHeader>
            <RadioGroup defaultValue="job" value={postType} onValueChange={(value: PostType) => setPostType(value)} className="grid grid-cols-2 gap-4 py-4">
                <Label htmlFor="job" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                    <RadioGroupItem value="job" id="job" className="sr-only" />
                    <Briefcase className="mb-3 h-8 w-8" />
                    Job
                </Label>
                <Label htmlFor="internship" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
                    <RadioGroupItem value="internship" id="internship" className="sr-only" />
                    <GraduationCap className="mb-3 h-8 w-8" />
                    Internship
                </Label>
            </RadioGroup>

            <DialogFooter>
              <Button onClick={handleNext}>Next</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
            <>
                <DialogHeader>
                    <DialogTitle>Describe the {postType}</DialogTitle>
                    <DialogDescription>
                    Paste the description below. Our AI will automatically structure it for you.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    rows={15}
                    value={unstructuredText}
                    onChange={(e) => setUnstructuredText(e.target.value)}
                    placeholder={`e.g., 'We are looking for a ${postType === 'job' ? 'software engineer' : 'marketing intern'}...'`}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button onClick={handleGenerate} disabled={loading || !unstructuredText}>
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Generate
                    </Button>
                </DialogFooter>
          </>
        )}

        {step === 3 && details && (
          <>
            <DialogHeader>
              <DialogTitle>Generated {postType} Details</DialogTitle>
              <DialogDescription>
                Review and edit the information before posting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="post-title">Title</Label>
                    <Input id="post-title" value={details.title || ''} onChange={(e) => setDetails({...details, title: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="post-location">Location</Label>
                        <Input id="post-location" value={details.location || ''} onChange={(e) => setDetails({...details, location: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="post-work-mode">Work Mode</Label>
                        <Select value={details.workMode} onValueChange={(value) => setDetails({...details, workMode: value as any})}>
                            <SelectTrigger id="post-work-mode">
                                <SelectValue placeholder="Select work mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="On-site">On-site</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Remote">Remote</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {postType === 'job' && (
                        <div className="space-y-2">
                            <Label htmlFor="job-salary">Salary</Label>
                            <Input id="job-salary" value={details.salary || ''} onChange={(e) => setDetails({...details, salary: e.target.value})} />
                        </div>
                    )}

                    {postType === 'internship' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="internship-stipend">Stipend</Label>
                                <Input id="internship-stipend" value={(details as InternshipDetails).stipend || ''} onChange={(e) => setDetails({...details, stipend: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="internship-duration">Duration (e.g., 3 months)</Label>
                                <Input id="internship-duration" value={(details as InternshipDetails).duration || ''} onChange={(e) => setDetails({...details, duration: e.target.value})} />
                            </div>
                        </>
                    )}
                </div>


                 <div className="space-y-2">
                    <Label htmlFor="post-responsibilities">Responsibilities</Label>
                    <Textarea id="post-responsibilities" rows={6} value={details.responsibilities || ''} onChange={(e) => setDetails({...details, responsibilities: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="post-skills">Skills</Label>
                    <Input id="post-skills" value={details.skills || ''} onChange={(e) => setDetails({...details, skills: e.target.value})} />
                     <p className="text-xs text-muted-foreground">Comma-separated skills</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="post-education">Education</Label>
                    <Input id="post-education" value={details.education || ''} onChange={(e) => setDetails({...details, education: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button>Post {postType}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
