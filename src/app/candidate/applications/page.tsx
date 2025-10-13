'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const applications = [
  { id: 'app1', jobTitle: 'Frontend Developer', company: 'TechCorp', status: 'AI Skill Test', appliedOn: '2023-10-26' },
  { id: 'app2', jobTitle: 'UX/UI Designer', company: 'DesignHub', status: 'Shortlisted', appliedOn: '2023-10-24' },
  { id: 'app3', jobTitle: 'Backend Engineer', company: 'Data Solutions', status: 'Applied', appliedOn: '2023-10-22' },
  { id: 'app4', jobTitle: 'Product Manager', company: 'Innovate LLC', status: 'AI Interview', appliedOn: '2023-10-20' },
  { id: 'app5', jobTitle: 'DevOps Engineer', company: 'Cloudways', status: 'Hired', appliedOn: '2023-10-15' },
];

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track the status of all your job applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.jobTitle}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.appliedOn}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'Hired' ? 'default' : 'secondary'}>{app.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/candidate/jobs/${app.id}`}>View Job</Link>
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
