'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';


export default function SkillTestReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
         <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/employer/skill-tests"><ArrowLeft className="mr-2" /> Back to Skill Tests</Link>
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Skill Test Report</CardTitle>
                <CardDescription>Report for test ID: {params.id}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>A detailed report for the skill test will be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
