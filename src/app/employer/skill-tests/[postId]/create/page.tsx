'use client';

import { use } from 'react';
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

export default function CreateSkillTestPage({ params }: { params: { postId: string } }) {
  const resolvedParams = use(params);
  
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/skill-tests"><ArrowLeft className="mr-2" /> Back to All Posts</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Create Skill Test</CardTitle>
                <CardDescription>For Post ID: {resolvedParams.postId}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A form to create a new skill test with questions, duration, etc., will be here.</p>
            </CardContent>
        </Card>
    </div>
  );

  return <EmployerLayout>{PageContent}</EmployerLayout>;
}
