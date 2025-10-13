'use client';

import { useState, useMemo } from 'react';
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
import { Briefcase, TestTube2, Bot, UserCheck, IndianRupee, Star, Check } from 'lucide-react';

const STAGE_COSTS = {
  application: 49,
  invite: 99,
  ai_skill_test: 199,
  traditional_skill_test: 49,
  ai_interview: 199,
  final_interview: 99,
  selection: 49,
};

type PipelineStage = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const pipelineStages: PipelineStage[] = [
    { id: 'application', name: 'Application', icon: <Briefcase className="w-5 h-5"/> },
    { id: 'shortlisting', name: 'Shortlisting', icon: <UserCheck className="w-5 h-5"/> },
    { id: 'skill_test', name: 'Skill Test', icon: <TestTube2 className="w-5 h-5"/> },
    { id: 'interview', name: 'Interview', icon: <Bot className="w-5 h-5"/> },
    { id: 'final_interview', name: 'Final Interview', icon: <UserCheck className="w-5 h-5"/> },
    { id: 'selection', name: 'Selection', icon: <Star className="w-5 h-5"/> },
];


export function CreatePipelineDialog({ open, onOpenChange, jobDetails }: { open: boolean, onOpenChange: (open: boolean) => void, jobDetails: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationType, setApplicationType] = useState({ application: false, invite: false });
  const [skillTestType, setSkillTestType] = useState<'ai' | 'traditional' | null>(null);
  const [includeAiInterview, setIncludeAiInterview] = useState(false);
  const [finalInterviewType, setFinalInterviewType] = useState<'in-person' | 'online' | null>(null);
  const [includeSelection, setIncludeSelection] = useState(false);


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

    if (includeSelection) {
        cost += STAGE_COSTS.selection;
    }


    return cost;
  }, [applicationType, skillTestType, includeAiInterview, finalInterviewType, includeSelection]);

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
            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
              <Checkbox id="application" checked={applicationType.application} onCheckedChange={(checked) => handleApplicationCheck('application', !!checked)} />
              <Label htmlFor="application" className="w-full cursor-pointer">
                <div className="flex justify-between items-center">
                    <span>Application Page</span>
                    <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.application}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Candidates apply through a dedicated page.</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
              <Checkbox id="invite" checked={applicationType.invite} onCheckedChange={(checked) => handleApplicationCheck('invite', !!checked)} />
              <Label htmlFor="invite" className="w-full cursor-pointer">
                 <div className="flex justify-between items-center">
                    <span>Invite to Apply</span>
                    <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.invite}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Invite candidates from our talent pool (includes Application Page).</p>
              </Label>
            </div>
          </div>
        );
      case 1: // Stage 2: Shortlisting - Informational
        return (
            <div>
                <h3 className="font-semibold text-lg">Stage 2: Shortlisting</h3>
                <p className="text-muted-foreground mt-2 p-4 border-dashed border-2 rounded-lg bg-secondary/50">This stage is included for free. After applications are received, you can review and shortlist the best candidates to move to the next stage.</p>
            </div>
        );
      case 2: // Stage 3: Skill Test
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 3: Skill Test (Compulsory)</h3>
             <RadioGroup value={skillTestType || ''} onValueChange={(value: 'ai' | 'traditional') => setSkillTestType(value)}>
                <Label htmlFor="ai_skill_test" className="flex items-start space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-all">
                    <RadioGroupItem value="ai" id="ai_skill_test" className="mt-1"/>
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">AI Skill Test</span>
                            <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.ai_skill_test}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Customized, auto-evaluated tests for each candidate.</p>
                    </div>
                </Label>
                 <Label htmlFor="traditional_skill_test" className="flex items-start space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-all">
                    <RadioGroupItem value="traditional" id="traditional_skill_test" className="mt-1"/>
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Traditional Skill Test</span>
                            <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.traditional_skill_test}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Upload your own questions for candidates.</p>
                    </div>
                </Label>
            </RadioGroup>
          </div>
        );
      case 3: // Stage 4: Interview
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 4: Interview (Optional)</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <div>
                    <Label htmlFor="ai-interview" className="font-medium">AI Interview</Label>
                    <p className="text-xs text-muted-foreground mt-1">Custom questions with behavioral & technical analysis.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.ai_interview}</Badge>
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
             <RadioGroup value={finalInterviewType || ''} onValueChange={(value: 'in-person' | 'online') => setFinalInterviewType(value)} className="mt-2">
                <Label htmlFor="in_person_interview" className="flex items-start space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-all">
                    <RadioGroupItem value="in-person" id="in_person_interview" className="mt-1"/>
                    <div className="w-full">
                        <span className="font-medium">In-Person Interview</span>
                        <p className="text-xs text-muted-foreground mt-1">Schedule interviews at your office.</p>
                    </div>
                </Label>
                 <Label htmlFor="online_interview" className="flex items-start space-x-3 p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer transition-all">
                    <RadioGroupItem value="online" id="online_interview" className="mt-1"/>
                    <div className="w-full">
                        <span className="font-medium">Online Interview</span>
                        <p className="text-xs text-muted-foreground mt-1">Schedule and conduct interviews online with a chat window.</p>
                    </div>
                </Label>
            </RadioGroup>
          </div>
        );
       case 5: // Stage 6: Selection
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stage 6: Selection (Optional)</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                <div>
                    <Label htmlFor="selection" className="font-medium">Final Selection</Label>
                    <p className="text-xs text-muted-foreground mt-1">Mark candidates as hired and send offer letters.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">₹{STAGE_COSTS.selection}</Badge>
                    <Switch id="selection" checked={includeSelection} onCheckedChange={setIncludeSelection} />
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !applicationType.application && !applicationType.invite) return true;
    if (currentStep === 2 && !skillTestType) return true;
    if (currentStep === 4 && !finalInterviewType) return true;
    return false;
  }

  const resetAndClose = () => {
    setCurrentStep(0);
    setApplicationType({ application: false, invite: false });
    setSkillTestType(null);
    setIncludeAiInterview(false);
    setFinalInterviewType(null);
    setIncludeSelection(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Create Custom Hiring Pipeline</DialogTitle>
          {jobDetails && <DialogDescription>For job: <span className="font-medium text-foreground">{jobDetails.title}</span></DialogDescription>}
        </DialogHeader>
        
        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start mt-4">
            <div className="relative">
                <div aria-hidden="true" className="absolute left-4 top-4 h-full w-0.5 bg-border -z-10"></div>
                <div className="flex flex-col gap-4">
                    {pipelineStages.map((stage, index) => (
                        <div key={stage.id} className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                                currentStep === index ? "bg-primary border-primary text-primary-foreground" :
                                currentStep > index ? "bg-green-500 border-green-500 text-white" :
                                "bg-background border-border"
                            )}>
                                {currentStep > index ? <Check className="w-5 h-5"/> : stage.icon}
                            </div>
                            <span className={cn("font-medium text-sm", currentStep === index ? "text-primary" : "text-muted-foreground")}>{stage.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-6 min-h-[300px]">
                {renderStageContent()}
            </div>
        </div>

        <Separator className="my-4"/>

        <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg">
            <p className="font-semibold">Total Pipeline Cost:</p>
            <p className="text-2xl font-bold flex items-center"><IndianRupee className="w-5 h-5 mr-1" />{totalCost}</p>
        </div>


        <DialogFooter className="mt-4">
          <div className="w-full flex justify-between">
            {currentStep > 0 ? (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
            ) : ( <div></div> )}

            {currentStep < pipelineStages.length - 1 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={isNextDisabled()}>Next</Button>
            ) : (
                <Button>Post Job &amp; Activate Pipeline</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
