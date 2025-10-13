'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

const drives = [
    { id: 'drive1', title: 'TechCorp Engineering Drive 2024', status: 'Active', applicants: 150 },
    { id: 'drive2', title: 'Innovate LLC Product Recruitment', status: 'Completed', applicants: 85 },
    { id: 'drive3', title: 'DesignHub Creative Hiring', status: 'Upcoming', applicants: 0 },
];

export default function TpoPlacementsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
       <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Placement Drives</h1>
                <p className="text-muted-foreground">Create and manage placement drives for your students.</p>
            </div>
            <Button asChild>
                <Link href="/tpo/placements/create">
                    <PlusCircle className="mr-2" /> Create New Drive
                </Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>All Drives</CardTitle>
          <CardDescription>Track all your placement drives.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drive Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drives.map((drive) => (
                <TableRow key={drive.id}>
                  <TableCell className="font-medium">{drive.title}</TableCell>
                  <TableCell><Badge variant={drive.status === 'Active' ? 'default' : 'secondary'}>{drive.status}</Badge></TableCell>
                  <TableCell>{drive.applicants}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Manage</Button>
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
