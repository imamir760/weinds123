'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Briefcase, TestTube2, Bot, UserCheck, IndianRupee } from 'lucide-react';

const STAGE_COSTS = {
  application: 49,
  invite: 99,
  ai_skill_test: 199,
  traditional_skill_test: 49,
  ai_interview: 199,
  final_interview: 99,
};

type PipelineStage = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const pipelineStages: PipelineStage[] = [
    { id: 'application', name: 'Application', icon: <Briefcase /> },
    { id: 'shortlisting', name: 'Shortlisting', icon: <UserCheck /> },
    { id: 'skill_test', name: 'Skill Test', icon: <TestTube2 /> },
    { id: 'interview', name: 'Interview', icon: <Bot /> },
    { id: 'final_interview', name: 'Final Interview', icon: <UserCheck /> },
];


export function CreatePipelineDialog({ open, onOpenChange, jobDetails }: { open: boolean, onOpenChange: (open: boolean) => void, jobDetails: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationType, setApplicationType] = useState({ application: false, invite: false });
  const [skillTestType, setSkillTestType] = useState<'ai' | 'traditional' | null>(null);
  const [includeAiInterview, setIncludeAiInterview] = useState(false);
  const [finalInterviewType, setFinalInterviewType] = useState<'in-person' | 'online' | null>(null);

  const totalCost = useMemo(() => {
    let cost = 0;
    if (applicationType.invite) {
        cost += STAGE_COSTS.invite;
    } else if (applicationType.application) {
        cost += STAGE_COSTS.application;
    }
    
    if (skillTestType === 'ai') {
        cost += STAGE_COSTS.ai_skill_test;
    } else if (skillTestType === 'traditional') {
        cost += STAGE_COSTS.traditional_skill_test;
    }

    if (includeAiInterview) {
        cost += STAGE_COSTS.ai_interview;
    }
    
    if (finalInterviewType) {
        cost += STAGE_COSTS.final_interview;
    }

    return cost;
  }, [applicationType, skillTestType, includeAiInterview, finalInterviewType]);

  const handleApplicationCheck = (type: 'application' | 'invite', checked: boolean) => {
      setApplicationType(prev => {
          if (type === 'invite' && checked) {
              return { application: true, invite: true };
          }
          if (type === 'application' && !checked) {
              return { application: false, invite: false };
          }
          return { ...prev, [type]: checked };
      });
  };

  const renderStageContent = () => {
    switch (currentStep) {
      case 0: // Stage 1: Application
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 1: Application</h3>
            <div className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <Checkbox id="application" checked={applicationType.application} onCheckedChange={(checked) => handleApplicationCheck('application', !!checked)} />
              <Label htmlFor="application" className="w-full">
                <div className="flex justify-between items-center">
                    <span>Application Page</span>
                    <Badge variant="outline">₹{STAGE_COSTS.application}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Candidates apply through a dedicated page.</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <Checkbox id="invite" checked={applicationType.invite} onCheckedChange={(checked) => handleApplicationCheck('invite', !!checked)} />
              <Label htmlFor="invite" className="w-full">
                 <div className="flex justify-between items-center">
                    <span>Invite to Apply</span>
                    <Badge variant="outline">₹{STAGE_COSTS.invite}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Invite candidates from our talent pool (includes Application Page).</p>
              </Label>
            </div>
          </div>
        );
      case 1: // Stage 2: Shortlisting - Informational
        return (
            <div>
                <h3 className="font-semibold text-lg">Stage 2: Shortlisting</h3>
                <p className="text-muted-foreground">This stage is included for free. You can shortlist candidates who have applied or have been invited.</p>
            </div>
        );
      case 2: // Stage 3: Skill Test
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 3: Skill Test (Compulsory)</h3>
             <RadioGroup value={skillTestType || ''} onValueChange={(value: 'ai' | 'traditional') => setSkillTestType(value)}>
                <Label htmlFor="ai_skill_test" className="flex items-start space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                    <RadioGroupItem value="ai" id="ai_skill_test" className="mt-1"/>
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <span>AI Skill Test</span>
                            <Badge variant="outline">₹{STAGE_COSTS.ai_skill_test}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Customized, auto-evaluated tests for each candidate.</p>
                    </div>
                </Label>
                 <Label htmlFor="traditional_skill_test" className="flex items-start space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                    <RadioGroupItem value="traditional" id="traditional_skill_test" className="mt-1"/>
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <span>Traditional Skill Test</span>
                            <Badge variant="outline">₹{STAGE_COSTS.traditional_skill_test}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Upload your own questions for candidates.</p>
                    </div>
                </Label>
            </RadioGroup>
          </div>
        );
      case 3: // Stage 4: Interview
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 4: Interview (Optional)</h3>
            <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                    <Label htmlFor="ai-interview">AI Interview</Label>
                    <p className="text-xs text-muted-foreground">Custom questions with behavioral & technical analysis.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline">₹{STAGE_COSTS.ai_interview}</Badge>
                    <Switch id="ai-interview" checked={includeAiInterview} onCheckedChange={setIncludeAiInterview} />
                </div>
            </div>
          </div>
        );
      case 4: // Stage 5: Final Interview
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 5: Final Interview</h3>
            <p className="text-sm text-muted-foreground">Schedule final interviews. This will cost an additional ₹{STAGE_COSTS.final_interview}.</p>
             <RadioGroup value={finalInterviewType || ''} onValueChange={(value: 'in-person' | 'online') => setFinalInterviewType(value)}>
                <Label htmlFor="in_person_interview" className="flex items-start space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                    <RadioGroupItem value="in-person" id="in_person_interview" className="mt-1"/>
                    <div className="w-full">
                        <span>In-Person Interview</span>
                        <p className="text-xs text-muted-foreground">Schedule interviews at your office.</p>
                    </div>
                </Label>
                 <Label htmlFor="online_interview" className="flex items-start space-x-2 p-4 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                    <RadioGroupItem value="online" id="online_interview" className="mt-1"/>
                    <div className="w-full">
                        <span>Online Interview</span>
                        <p className="text-xs text-muted-foreground">Schedule and conduct interviews online with a chat window.</p>
                    </div>
                </Label>
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !applicationType.application && !applicationType.invite) return true;
    if (currentStep === 2 && !skillTestType) return true;
    return false;
  }

  const resetAndClose = () => {
    setCurrentStep(0);
    setApplicationType({ application: false, invite: false });
    setSkillTestType(null);
    setIncludeAiInterview(false);
    setFinalInterviewType(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Create Hiring Pipeline</DialogTitle>
          {jobDetails && <DialogDescription>For job: {jobDetails.title}</DialogDescription>}
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 relative">
                <div className="flex flex-col items-center">
                    {pipelineStages.map((stage, index) => (
                        <div key={stage.id} className="flex flex-col items-center w-full">
                            <div className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                                currentStep === index ? "border-primary bg-primary/10" : "border-transparent",
                                currentStep > index ? "opacity-50" : "opacity-100"
                            )}>
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                                    currentStep === index ? "bg-primary text-primary-foreground" : "bg-muted",
                                    currentStep > index ? "bg-green-500 text-white" : ""
                                )}>
                                    {stage.icon}
                                </div>
                                <span className="font-medium">{stage.name}</span>
                            </div>
                            {index < pipelineStages.length - 1 && (
                                <div className={cn("w-0.5 h-8 my-1 transition-colors", currentStep > index ? 'bg-green-500' : 'bg-muted')}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 space-y-6">
                {renderStageContent()}
                <Separator />
                <div className="flex justify-between items-center">
                    <p className="font-semibold">Total Cost:</p>
                    <p className="text-2xl font-bold flex items-center"><IndianRupee className="w-5 h-5" />{totalCost}</p>
                </div>
            </div>
        </div>

        <DialogFooter>
          {currentStep > 0 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>}
          {currentStep < pipelineStages.length - 1 ? (
             <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={isNextDisabled()}>Next</Button>
          ) : (
            <Button>Create Pipeline</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
