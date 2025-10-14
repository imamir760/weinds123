
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
import { collection, query, where, getDocs, doc, getDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Applicant {
    candidateId: string;
    appliedOn: Timestamp;
    status: string;
    postTitle: string;
    postId: string;
    postType: 'job' | 'internship';
    candidateName?: string;
    candidateEmail?: string;
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

        const fetchAllData = async () => {
            setLoading(true);
            
            try {
                const applicationsQuery = query(collection(db, 'applications'), where("employerId", "==", user.uid));
                
                const applicationsSnapshot = await getDocs(applicationsQuery).catch(serverError => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'applications', operation: 'list'}));
                    return null;
                });

                if (!applicationsSnapshot) {
                    setAllApplicants([]);
                    setLoading(false);
                    return;
                }
                
                const applicationsData = applicationsSnapshot.docs.map(d => ({ ...d.data() }) as Applicant);

                if (applicationsData.length === 0) {
                    setAllApplicants([]);
                    setLoading(false);
                    return;
                }
                
                const candidateIds = [...new Set(applicationsData.map(app => app.candidateId))];
                const candidateProfiles = new Map<string, DocumentData>();

                if (candidateIds.length > 0) {
                    const candidatePromises = candidateIds.map(id => {
                        const candidateDocRef = doc(db, 'candidates', id);
                        return getDoc(candidateDocRef).catch(serverError => {
                            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: candidateDocRef.path, operation: 'get' }));
                            return null;
                        })
                    });
                    const candidateSnapshots = await Promise.all(candidatePromises);
                    candidateSnapshots.forEach(snap => {
                        if(snap && snap.exists()) {
                           candidateProfiles.set(snap.id, snap.data());
                        }
                    });
                }
                
                const finalApplicants = applicationsData.map(app => {
                    const profile = candidateProfiles.get(app.candidateId);
                    return {
                        ...app,
                        candidateName: profile?.fullName || 'Unknown Candidate',
                        candidateEmail: profile?.email || 'No email',
                    };
                }).sort((a,b) => b.appliedOn.toMillis() - a.appliedOn.toMillis());

                setAllApplicants(finalApplicants);

            } catch (error) {
                console.error("An unexpected error occurred in fetchAllData:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAllData();

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
                                <TableRow key={`${app.postId}-${app.candidateId}`}>
                                    <TableCell className="font-medium">
                                         <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9">
                                                <AvatarFallback>{app.candidateName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p>{app.candidateName}</p>
                                                <p className="text-xs text-muted-foreground">{app.candidateEmail}</p>
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
