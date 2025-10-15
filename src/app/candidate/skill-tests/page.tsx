
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData, Timestamp, query, where } from 'firebase/firestore';
import { Loader2, TestTube2, Building, FileText } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';

interface ApplicationForTest extends DocumentData {
  id: string; // application id
  postTitle: string;
  companyName: string;
  postId: string;
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [skillTests, setSkillTests] = useState<ApplicationForTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const appsRef = collection(db, 'applications');
      // Query for applications that are in the 'Skill Test' stage for the current candidate
      const q = query(appsRef, where('candidateId', '==', user.uid), where('status', '==', 'Skill Test'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationForTest));
        setSkillTests(tests);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `applications where candidateId == ${user.uid} and status == 'Skill Test'`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <TestTube2 className="w-6 h-6"/>
                <div>
                    <CardTitle>My Skill Tests</CardTitle>
                    <CardDescription>Assessments sent to you by potential employers.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : skillTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No skill tests</h3>
              <p className="mt-1 text-sm text-gray-500">You have not been assigned any skill tests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
                {skillTests.map((test) => (
                    <Card key={test.id}>
                        <CardHeader>
                            <CardTitle>{test.postTitle}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Building className="w-4 h-4" /> {test.companyName || 'A Company'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                           <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <p>Status: <Badge variant="default">Pending</Badge></p>
                           </div>
                           <div>
                                <Button asChild>
                                    <Link href={`/candidate/skill-tests/${test.postId}`}>Start Test</Link>
                                </Button>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
