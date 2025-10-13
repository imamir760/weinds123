'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const interviews = [
  { id: 'interview1', candidateName: 'Aarav Sharma', jobTitle: 'Senior Frontend Developer', type: 'AI Interview', status: 'Pending' },
  { id: 'interview2', candidateName: 'Diya Patel', jobTitle: 'UX/UI Designer', type: 'AI Skill Test', status: 'Completed' },
];

export default function EmployerInterviewsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Interviews</CardTitle>
          <CardDescription>Track all AI-powered interviews and skill tests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell className="font-medium">{interview.candidateName}</TableCell>
                  <TableCell>{interview.jobTitle}</TableCell>
                  <TableCell>{interview.type}</TableCell>
                  <TableCell>
                    <Badge variant={interview.status === 'Completed' ? 'secondary' : 'default'}>
                      {interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/employer/interviews/${interview.id}`}>View Report</Link>
                    </Button>
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
