
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
import { Loader2, TestTube2, Building, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';

interface SkillTest extends DocumentData {
  id: string;
  title: string;
  employerId: string;
  companyName: string;
  duration: number; // in minutes
  createdAt: Timestamp;
  status: 'pending' | 'completed';
  candidateId: string;
}

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [skillTests, setSkillTests] = useState<SkillTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const testsRef = collection(db, 'skill_tests');
      const q = query(testsRef, where('candidateId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillTest));
        setSkillTests(tests);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `skill_tests where candidateId == ${user.uid}`,
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

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

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
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Building className="w-4 h-4" /> {test.companyName || 'A Company'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                           <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {test.duration} minutes</div>
                                <div className="flex items-center gap-1.5">
                                    <p>Status:</p>
                                    <Badge variant={test.status === 'completed' ? 'secondary' : 'default'} className="capitalize">{test.status}</Badge>
                                </div>
                           </div>
                           <div>
                                {test.status === 'pending' ? (
                                    <Button asChild>
                                        <Link href={`/candidate/skill-tests/${test.id}`}>Start Test</Link>
                                    </Button>
                                ) : (
                                     <Button variant="outline" asChild>
                                         <Link href={`/candidate/skill-tests/${test.id}/result`}>View Result</Link>
                                     </Button>
                                )}
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
