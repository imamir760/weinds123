'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmployerInternshipsPage() {
    return (
        <div className="container mx-auto py-8 px-4">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Internship Postings</h1>
                    <p className="text-muted-foreground">Manage your internship programs.</p>
                </div>
                <Button asChild>
                    <Link href="/employer/internships/create">
                        <PlusCircle className="mr-2" /> Post Internship
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>My Internships</CardTitle>
                    <CardDescription>A list of your current and past internship postings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>You haven't posted any internships yet.</p>
                        <Button variant="link" asChild className="mt-2">
                             <Link href="/employer/internships/create">Post your first internship</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
