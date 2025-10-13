'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Building, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const stats = [
    { title: 'Total Students', value: '1250', icon: <Users className="w-6 h-6 text-primary" /> },
    { title: 'Partner Companies', value: '48', icon: <Building className="w-6 h-6 text-primary" /> },
    { title: 'Ongoing Drives', value: '5', icon: <Briefcase className="w-6 h-6 text-primary" /> },
];

const recentDrives = [
    { id: 'drive1', company: 'TechCorp', role: 'Software Engineer Trainee', applicants: 150 },
    { id: 'drive2', company: 'Innovate LLC', role: 'Product Analyst Intern', applicants: 85 },
];


export default function TpoDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">TPO Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, IIT Bombay Placement Office
          </p>
        </div>
        <Button asChild>
          <Link href="/tpo/placements/create">
            <PlusCircle className="mr-2" /> Create Placement Drive
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Recent Placement Drives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentDrives.map(drive => (
                    <div key={drive.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                        <div>
                            <p className="font-semibold">{drive.role} at {drive.company}</p>
                            <p className="text-sm text-muted-foreground">{drive.applicants} applicants</p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                    </div>
                ))}
            </CardContent>
       </Card>
    </div>
  );
}
