
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import EmployerDashboardPage from '../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Applicant extends DocumentData {
    id: string; // application ID
    candidateId: string;
    appliedOn: Timestamp;
    status: string;
    postTitle: string;
    postId: string;
    postType: 'job' | 'internship';
    candidateName: string;
    candidateEmail: string;
}

export default function AllCandidatesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
    const [showInternships, setShowInternships] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const applicationsQuery = query(collection(db, 'applications'), where("employerId", "==", user.uid));
        
        const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
            const applicantsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Applicant)
                .sort((a,b) => b.appliedOn.toMillis() - a.appliedOn.toMillis());

            setAllApplicants(applicantsData);
            setLoading(false);
        }, (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: 'applications',
                operation: 'list',
                requestResourceData: { employerId: user.uid }
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user]);

    const displayedApplicants = showInternships ? allApplicants.filter(a => a.postType === 'internship') : allApplicants.filter(a => a.postType === 'job');

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
                            <CardTitle>All Applicants</CardTitle>
                            <CardDescription>Browse all candidates who have applied to your posts.</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Label htmlFor="app-type-toggle" className="flex items-center gap-2 cursor-pointer">
                                <Briefcase className={!showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                                <span className={!showInternships ? 'text-primary font-semibold' : 'text-muted-foreground'}>Job Applicants</span>
                            </Label>
                            <Switch 
                                id="app-type-toggle"
                                checked={showInternships}
                                onCheckedChange={setShowInternships}
                            />
                            <Label htmlFor="app-type-toggle" className="flex items-center gap-2 cursor-pointer">
                                <GraduationCap className={showInternships ? 'text-primary' : 'text-muted-foreground'}/>
                                <span className={showInternships ? 'text-primary font-semibold' : 'text-muted-foreground'}>Internship Applicants</span>
                            </Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : displayedApplicants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No applicants found for {showInternships ? 'internships' : 'jobs'}.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Applied For</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedApplicants.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">
                                         <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9">
                                                <AvatarFallback>{app.candidateName?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p>{app.candidateName || 'Unknown Candidate'}</p>
                                                <p className="text-xs text-muted-foreground">{app.candidateEmail || 'No email'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p>{app.postTitle}</p>
                                    </TableCell>
                                    <TableCell>{formatDate(app.appliedOn)}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{app.status.replace(/_/g, ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/employer/${app.postType}s/${app.postId}/candidates/${app.candidateId}`}>View Profile</Link>
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

    return (
        <EmployerDashboardPage>
            {PageContent}
        </EmployerDashboardPage>
    );
}
