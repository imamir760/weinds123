'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const candidates = [
  { id: 'c1', name: 'Aarav Sharma', score: 92, avatar: PlaceHolderImages[1], skills: ['React', 'TypeScript'], status: 'AI Interview' },
  { id: 'c2', name: 'Diya Patel', score: 88, avatar: PlaceHolderImages[2], skills: ['Figma', 'UX Research'], status: 'Shortlisted' },
  { id: 'c3', name: 'Vivaan Singh', score: 95, avatar: PlaceHolderImages[3], skills: ['Node.js', 'PostgreSQL'], status: 'Applied' },
];

export default function AllCandidatesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>Browse all candidates in your talent pool.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                   <AvatarImage src={candidate.avatar.imageUrl} alt={candidate.name} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-primary font-bold">Match: {candidate.score}%</p>
                 <div className="mt-2">
                    <Badge>{candidate.status}</Badge>
                 </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {candidate.skills.map(skill => <Badge variant="secondary" key={skill}>{skill}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
