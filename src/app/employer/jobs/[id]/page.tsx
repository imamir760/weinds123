'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoveHorizontal } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const pipeline = {
  jobTitle: 'Senior Frontend Developer',
  stages: [
    {
      name: 'Applied',
      candidates: [
        { id: 'c1', name: 'Aarav Sharma', score: 92, avatar: PlaceHolderImages[1] },
        { id: 'c2', name: 'Diya Patel', score: 88, avatar: PlaceHolderImages[2] },
      ],
    },
    {
      name: 'Shortlisted',
      candidates: [
        { id: 'c3', name: 'Vivaan Singh', score: 95, avatar: PlaceHolderImages[3] },
      ],
    },
    { name: 'AI Skill Test', candidates: [] },
    { name: 'AI Interview', candidates: [] },
    { name: 'Hired', candidates: [] },
  ],
};

export default function JobPipelinePage({ params }: { params: { id: string } }) {
  const { id: jobId } = params;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Hiring Pipeline</h1>
        <p className="text-muted-foreground">{pipeline.jobTitle}</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
        {pipeline.stages.map(stage => (
          <div key={stage.name} className="w-80 flex-shrink-0">
            <Card className="h-full bg-secondary/50 dark:bg-secondary/20">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{stage.name}</span>
                  <span className="text-base font-normal text-muted-foreground bg-background px-2 py-0.5 rounded">
                    {stage.candidates.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stage.candidates.map(candidate => (
                  <Card key={candidate.id} className="bg-background shadow-md hover:shadow-lg transition-shadow duration-300">
                     <Link href={`/employer/jobs/${jobId}/candidates/${candidate.id}`}>
                        <CardContent className="p-4 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={candidate.avatar.imageUrl} alt={candidate.name} data-ai-hint={candidate.avatar.imageHint}/>
                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{candidate.name}</p>
                                <p className="text-xs text-muted-foreground">
                                Match: <span className="font-bold text-primary">{candidate.score}%</span>
                                </p>
                            </div>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <MoveHorizontal className="w-4 h-4"/>
                            </Button>
                        </div>
                        </CardContent>
                    </Link>
                  </Card>
                ))}
                {stage.candidates.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    Drag candidates here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
