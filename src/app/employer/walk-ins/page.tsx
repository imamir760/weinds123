'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function WalkInsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Walk-in Drives</h1>
                <p className="text-muted-foreground">Manage your walk-in interview events.</p>
            </div>
            <Button asChild>
                <Link href="/employer/walk-ins/create">
                    <PlusCircle className="mr-2" /> Create New Drive
                </Link>
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Drives</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center py-12 text-muted-foreground">
                <p>No upcoming walk-in drives.</p>
                 <Button variant="link" asChild className="mt-2">
                    <Link href="/employer/walk-ins/create">Create your first drive</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
