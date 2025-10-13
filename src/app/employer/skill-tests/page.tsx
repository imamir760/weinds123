'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const tests = [
  { id: 'test1', candidateName: 'Diya Patel', jobTitle: 'UX/UI Designer', score: 85, status: 'Completed' },
  { id: 'test2', candidateName: 'Rohan Mehta', jobTitle: 'Senior Frontend Developer', score: null, status: 'Sent' },
];

export default function SkillTestsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Skill Tests</CardTitle>
          <CardDescription>Track candidate performance on AI-generated skill tests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.candidateName}</TableCell>
                  <TableCell>{test.jobTitle}</TableCell>
                  <TableCell>{test.score ? `${test.score}%` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={test.status === 'Completed' ? 'secondary' : 'outline'}>{test.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {test.status === 'Completed' ? (
                       <Button asChild variant="outline" size="sm">
                          <Link href={`/employer/skill-tests/${test.id}`}>View Report</Link>
                       </Button>
                    ) : (
                       <Button variant="ghost" size="sm">Remind</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
