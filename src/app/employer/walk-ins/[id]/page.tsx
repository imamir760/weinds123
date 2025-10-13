'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WalkInDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/walk-ins"><ArrowLeft className="mr-2" /> Back to Drives</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Walk-in Drive Details</CardTitle>
                <CardDescription>Details for drive ID: {params.id}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Information about the walk-in drive, including date, time, location, and registered candidates, will be shown here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
