
'use client';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EvaluateSkillTestOutput } from '@/ai/dev';
import { Timestamp } from 'firebase/firestore';
import { ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle, FileQuestion, FileBarChart2 } from 'lucide-react';

export type ReportEvaluation = Omit<EvaluateSkillTestOutput, 'submission'>;

export interface Report extends ReportEvaluation {
    id: string; // reportId
    submissionId: string;
    generatedAt: Timestamp;
}

export interface FullReport extends Report {
    submission: {
      questionText: string;
      candidateAnswer: string;
      correctAnswer: string;
    }[];
}

export const ReportDialog = ({ report, open, onOpenChange }: { report: FullReport | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
    if (!report) return null;

    const isAnswerCorrect = (candidateAnswer: string, correctAnswer: string) => {
        if (typeof candidateAnswer !== 'string' || typeof correctAnswer !== 'string') return false;
        return candidateAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><FileBarChart2 /> Skill Test Report</DialogTitle>
                    <DialogDescription>Generated on {new Date(report.generatedAt.seconds * 1000).toLocaleDateString()}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                             <div className="relative w-24 h-24">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200 dark:text-gray-700"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-primary"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeDasharray={`${report.score}, 100`}
                                        strokeLinecap="round"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{report.score}</span>
                                </div>
                            </div>
                            <p className="flex-1 text-muted-foreground">{report.summary}</p>
                        </CardContent>
                    </Card>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ThumbsUp className="text-green-500"/> Strengths</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ThumbsDown className="text-destructive"/> Areas for Improvement</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                    {report.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileQuestion/> Detailed Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {report.submission?.map((item, index) => {
                                    const isCorrect = isAnswerCorrect(item.candidateAnswer, item.correctAnswer);
                                    return (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-3">
                                                     {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500"/> : <AlertTriangle className="w-5 h-5 text-destructive"/> }
                                                     <span className="text-left">Question {index + 1}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4">
                                                <p className="font-semibold">{item.questionText}</p>
                                                <div>
                                                    <p className="text-sm font-medium">Your Answer:</p>
                                                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-secondary rounded">{item.candidateAnswer || '(Not answered)'}</p>
                                                </div>
                                                {!isCorrect && (
                                                    <div>
                                                        <p className="text-sm font-medium">Correct Answer:</p>
                                                        <p className="text-sm text-muted-foreground mt-1 p-2 bg-secondary rounded">{item.correctAnswer}</p>
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
