'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, UserPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const students = [
    { id: 's1', name: 'Aarav Sharma', branch: 'Computer Science', status: 'Eligible' },
    { id: 's2', name: 'Diya Patel', branch: 'Electronics', status: 'Placed' },
    { id: 's3', name: 'Vivaan Singh', branch: 'Mechanical', status: 'Eligible' },
];

export default function TpoStudentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Management</h1>
          <p className="text-muted-foreground">
            Manage and verify student profiles for placements.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Upload className="mr-2"/> Bulk Upload CSV</Button>
            <Button><UserPlus className="mr-2"/> Add Student</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
             <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Registered Students</CardTitle>
                    <CardDescription>A list of all students registered under your institution.</CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-10" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Placement Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map(student => (
                         <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.branch}</TableCell>
                            <TableCell>
                                <Badge variant={student.status === 'Placed' ? 'secondary' : 'default'}>{student.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">View Profile</Button>
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
