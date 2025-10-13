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
import { Search, Building, GraduationCap, Code } from 'lucide-react';

const institutions = [
  { id: 'i1', name: 'IIT Bombay', location: 'Mumbai', students: 1200, specializations: ['Engineering', 'Data Science'] },
  { id: 'i2', name: 'BITS Pilani', location: 'Pilani', students: 950, specializations: ['Computer Science', 'Electronics'] },
  { id: 'i3', name: 'VIT Vellore', location: 'Vellore', students: 1500, specializations: ['IT', 'Mechanical', 'Biotech'] },
];

export default function CampusPoolPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Talent Pool</CardTitle>
          <CardDescription>
            Discover and connect with top talent from leading institutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search institutions..." className="pl-10" />
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Specialization" className="pl-10" />
            </div>
            <Button className="w-full">Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map(inst => (
          <Card key={inst.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                    <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle>{inst.name}</CardTitle>
                    <CardDescription>{inst.location}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <p>{inst.students} Students</p>
                <Button variant="outline" size="sm">Invite to Drive</Button>
              </div>
               <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Code className="w-4 h-4"/> Top Specializations</h4>
                <div className="flex flex-wrap gap-2">
                    {inst.specializations.map(spec => (
                        <div key={spec} className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                            {spec}
                        </div>
                    ))}
                </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
