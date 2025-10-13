'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

const candidates = [
  { id: 'c2', name: 'Diya Patel', score: 88, avatar: PlaceHolderImages[2], job: 'UX/UI Designer' },
  { id: 'c3', name: 'Vivaan Singh', score: 95, avatar: PlaceHolderImages[3], job: 'Senior Frontend Developer' },
];

export default function ShortlistedCandidatesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Shortlisted Candidates</CardTitle>
          <CardDescription>Candidates you have shortlisted across all jobs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={candidate.avatar.imageUrl} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">For: {candidate.job}</p>
                        <p className="text-sm font-bold text-primary">Match: {candidate.score}%</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm">Schedule AI Test</Button>
                    <Button size="sm" variant="outline">View Profile</Button>
                </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
