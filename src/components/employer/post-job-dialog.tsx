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
import { Briefcase, GraduationCap, Loader2, DollarSign, Clock, MapPin, Building, BookOpen, Star, ChevronsRight, Monitor, Users } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { generateJobDescription } from '@/ai/flows/generate-job-description';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Combobox } from '../ui/combobox';
import { cities } from '@/lib/cities';

type PostType = 'job' | 'internship';
type JobDetails = {
  title: string;
  responsibilities: string;
  skills: string;
  salary?: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';
  education?: string;
  experience?: string;
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

  const JDPreview = () => {
      if (!details) return null;

      const isInternship = 'stipend' in details;
      const skillsArray = details.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const responsibilitiesArray = details.responsibilities?.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean) || [];

      return (
        <div className="p-4 border rounded-lg bg-secondary/50 space-y-6">
            <h3 className="text-xl font-bold text-foreground">{details.title}</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><Building className="w-4 h-4"/> Your Company Name</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-4 h-4"/> {details.location}</div>
                { isInternship ? <div className="flex items-center gap-1.5"><DollarSign className="h-4 h-4"/> {details.stipend} (Stipend)</div> : <div className="flex items-center gap-1.5"><DollarSign className="h-4 h-4"/> {details.salary}</div> }
                { isInternship && <div className="flex items-center gap-1.5"><Clock className="h-4 h-4"/> {details.duration}</div>}
                <div className="flex items-center gap-1.5"><Monitor className="w-4 h-4" /> {details.workMode}</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {details.experience}</div>
            </div>

            <Separator />

             <div>
              <h4 className="font-semibold text-md mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary"/> Education</h4>
              <p className="text-muted-foreground">{details.education}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-md mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Responsibilities</h4>
              <ol className="space-y-2 text-muted-foreground list-decimal pl-5">
                {responsibilitiesArray.map((resp, index) => (
                  <li key={index}>
                    <span>{resp}</span>
                  </li>
                ))}
              </ol>
            </div>

             <div>
              <h4 className="font-semibold text-md mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-primary"/> Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill) => (
                  <div key={skill} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
        </div>
      )
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
              <DialogDescription>
                What type of position are you looking to fill?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RadioGroup defaultValue="job" value={postType} onValueChange={(value: PostType) => setPostType(value)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Label htmlFor="job" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer h-32">
                      <RadioGroupItem value="job" id="job" className="sr-only" />
                      <Briefcase className="mb-3 h-8 w-8" />
                      Job
                  </Label>
                  <Label htmlFor="internship" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer h-32">
                      <RadioGroupItem value="internship" id="internship" className="sr-only" />
                      <GraduationCap className="mb-3 h-8 w-8" />
                      Internship
                  </Label>
              </RadioGroup>
            </div>

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
                <div className="flex-grow">
                  <Textarea
                      rows={15}
                      className="h-full"
                      value={unstructuredText}
                      onChange={(e) => setUnstructuredText(e.target.value)}
                      placeholder={`e.g., 'We are looking for a ${postType === 'job' ? 'software engineer' : 'marketing intern'}...'`}
                  />
                </div>
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
              <DialogTitle>Review Generated {postType === 'job' ? 'Job' : 'Internship'}</DialogTitle>
              <DialogDescription>
                Edit the AI-generated details below and see a live preview before posting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 flex-grow min-h-0">
                <ScrollArea className="h-full">
                    <div className="space-y-4 pr-6">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">Title</Label>
                            <Input id="post-title" value={details.title || ''} onChange={(e) => setDetails({...details, title: e.target.value})} className="bg-background"/>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="post-location">Location</Label>
                                <Combobox
                                  items={cities}
                                  value={details.location || ""}
                                  onChange={(value) => setDetails({ ...details, location: value })}
                                  placeholder="Select location..."
                                  searchPlaceholder="Search cities..."
                                  notFoundText="No city found."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="post-work-mode">Work Mode</Label>
                                <Select value={details.workMode} onValueChange={(value) => setDetails({...details, workMode: value as any})}>
                                    <SelectTrigger id="post-work-mode" className="bg-background">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {postType === 'job' && 'salary' in details && (
                                <div className="space-y-2">
                                    <Label htmlFor="job-salary">Salary</Label>
                                    <Input id="job-salary" value={details.salary || ''} onChange={(e) => setDetails({...details, salary: e.target.value})} className="bg-background"/>
                                </div>
                            )}
                            {postType === 'internship' && 'stipend' in details && (
                                <div className="space-y-2">
                                    <Label htmlFor="internship-stipend">Stipend</Label>
                                    <Input id="internship-stipend" value={(details as InternshipDetails).stipend || ''} onChange={(e) => setDetails({...details, stipend: e.target.value})} className="bg-background"/>
                                </div>
                            )}
                             <div className="space-y-2">
                                <Label htmlFor="experience">Experience</Label>
                                <Input id="experience" value={details.experience || ''} onChange={(e) => setDetails({...details, experience: e.target.value})} className="bg-background"/>
                            </div>
                        </div>
                         {postType === 'internship' && 'duration' in details && (
                            <div className="space-y-2">
                                <Label htmlFor="internship-duration">Duration (e.g., 3 months)</Label>
                                <Input id="internship-duration" value={(details as InternshipDetails).duration || ''} onChange={(e) => setDetails({...details, duration: e.target.value})} className="bg-background"/>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="post-education">Education</Label>
                            <Input id="post-education" value={details.education || ''} onChange={(e) => setDetails({...details, education: e.target.value})} className="bg-background"/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-responsibilities">Responsibilities</Label>
                            <Textarea id="post-responsibilities" rows={8} value={details.responsibilities || ''} onChange={(e) => setDetails({...details, responsibilities: e.target.value})} className="bg-background"/>
                             <p className="text-xs text-muted-foreground">One responsibility per line, numbered.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="post-skills">Skills</Label>
                            <Input id="post-skills" value={details.skills || ''} onChange={(e) => setDetails({...details, skills: e.target.value})} className="bg-background"/>
                            <p className="text-xs text-muted-foreground">Comma-separated skills</p>
                        </div>
                    </div>
                </ScrollArea>
                <ScrollArea className="h-full">
                     <div className="pr-2">
                        <Label className="text-base font-semibold">Live Preview</Label>
                        <div className="mt-2">
                            <JDPreview />
                        </div>
                    </div>
                </ScrollArea>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button>Post {postType}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
