'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EmployerLayout from '@/app/employer/layout';

export default function ViewSkillTestsPage({ params }: { params: { postId: string } }) {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/skill-tests"><ArrowLeft className="mr-2" /> Back to All Posts</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Skill Tests</CardTitle>
                <CardDescription>Viewing all tests for Post ID: {params.postId}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A list of existing skill tests for this post will be shown here.</p>
            </CardContent>
        </Card>
    </div>
  );
  
  return <EmployerLayout>{PageContent}</EmployerLayout>;
}
