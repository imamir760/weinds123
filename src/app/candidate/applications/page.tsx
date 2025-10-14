
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Application extends DocumentData {
  id: string;
  postTitle: string;
  companyName: string;
  appliedOn: Timestamp;
  status: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [internshipApplications, setInternshipApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternships, setShowInternships] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const jobAppsRef = collection(db, 'candidates', user.uid, 'jobApplications');
      const internAppsRef = collection(db, 'candidates', user.uid, 'internshipApplications');

      const jobUnsubscribe = onSnapshot(jobAppsRef, (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setJobApplications(apps);
        setLoading(false);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: jobAppsRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });

      const internUnsubscribe = onSnapshot(internAppsRef, (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
        setInternshipApplications(apps);
        setLoading(false);
      },
      (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: internAppsRef.path,
              operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setLoading(false);
      });

      return () => {
        jobUnsubscribe();
        internUnsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const displayedApplications = showInternships ? internshipApplications : jobApplications;
  
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of all your applications.</CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                <Label htmlFor="app-type-toggle" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className={!showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                  <span className={!showInternships ? 'text-primary' : 'text-muted-foreground'}>Jobs</span>
                </Label>
                <Switch 
                  id="app-type-toggle"
                  checked={showInternships}
                  onCheckedChange={setShowInternships}
                />
                 <Label htmlFor="app-type-toggle" className="flex items-center gap-2 cursor-pointer">
                   <GraduationCap className={showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                   <span className={showInternships ? 'text-primary' : 'text-muted-foreground'}>Internships</span>
                </Label>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : displayedApplications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't applied for any {showInternships ? 'internships' : 'jobs'} yet.</p>
              <Button asChild variant="link">
                 <Link href={showInternships ? '/candidate/internships' : '/candidate/jobs'}>Find {showInternships ? 'Internships' : 'Jobs'}</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.postTitle}</TableCell>
                    <TableCell>{app.companyName}</TableCell>
                    <TableCell>{formatDate(app.appliedOn)}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'Hired' ? 'default' : 'secondary'}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/candidate/${showInternships ? 'internships' : 'jobs'}/${app.id}`}>View Post</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
