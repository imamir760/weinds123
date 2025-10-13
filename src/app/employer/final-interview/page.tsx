'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const interviews = [
    { jobId: 'job1', candidateId: 'c1', candidateName: 'Vivaan Singh', jobTitle: 'Senior Frontend Developer', status: 'Scheduled' },
    { jobId: 'job2', candidateId: 'c2', candidateName: 'Aarav Sharma', jobTitle: 'UX/UI Designer', status: 'Completed' },
];

export default function FinalInterviewListPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Final Interviews</CardTitle>
          <CardDescription>Manage and track final round interviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.jobId + interview.candidateId}>
                  <TableCell className="font-medium">{interview.candidateName}</TableCell>
                  <TableCell>{interview.jobTitle}</TableCell>
                  <TableCell><Badge variant={interview.status === 'Completed' ? 'secondary' : 'default'}>{interview.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline">
                      <Link href={`/employer/final-interview/${interview.jobId}/${interview.candidateId}`}>View Details</Link>
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
