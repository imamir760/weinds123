
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

interface Applicant {
    candidateId: string;
    appliedOn: Timestamp;
    currentStage: string;
    postTitle: string;
    postId: string;
    postType: 'job' | 'internship';
    candidateName?: string;
    candidateEmail?: string;
    candidateSkills?: string[];
}

export default function AllCandidatesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
    const [jobPosts, setJobPosts] = useState<{ id: string, title: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState('all');

    useEffect(() => {
        if (!user) return;

        const fetchAllApplicants = async () => {
            setLoading(true);
            try {
                // 1. Fetch all jobs and internships for the employer
                const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.uid));
                const internshipsQuery = query(collection(db, "internships"), where("employerId", "==", user.uid));

                const [jobsSnapshot, internshipsSnapshot] = await Promise.all([
                    getDocs(jobsQuery),
                    getDocs(internshipsQuery)
                ]);

                const posts = [
                    ...jobsSnapshot.docs.map(d => ({ id: d.id, type: 'job' as const, ...d.data() })),
                    ...internshipsSnapshot.docs.map(d => ({ id: d.id, type: 'internship' as const, ...d.data() }))
                ];
                
                setJobPosts(posts.map(p => ({ id: p.id, title: p.title })));

                if (posts.length === 0) {
                    setAllApplicants([]);
                    setLoading(false);
                    return;
                }

                // 2. For each post, create a promise to fetch its applicants
                const applicantPromises = posts.map(post => {
                    const applicantsCollectionRef = collection(db, post.type === 'job' ? 'jobs' : 'internships', post.id, 'applicants');
                    return getDocs(applicantsCollectionRef).then(snapshot => 
                        snapshot.docs.map(d => ({
                            ...d.data(),
                            candidateId: d.id,
                            postId: post.id,
                            postTitle: post.title,
                            postType: post.type,
                        } as Applicant))
                    );
                });

                const applicantsByPost = await Promise.all(applicantPromises);
                const allApplicantsFlat = applicantsByPost.flat();
                
                // 3. Gather unique candidate IDs
                const candidateIds = [...new Set(allApplicantsFlat.map(app => app.candidateId))];

                // 4. Fetch unique candidate profiles
                const candidateProfiles = new Map<string, DocumentData>();
                if (candidateIds.length > 0) {
                     const candidatePromises = candidateIds.map(id => getDoc(doc(db, 'candidates', id)));
                     const candidateSnapshots = await Promise.all(candidatePromises);
                     candidateSnapshots.forEach(snap => {
                         if(snap.exists()) {
                            candidateProfiles.set(snap.id, snap.data());
                         }
                     });
                }
            
                // 5. Combine data
                const combinedApplicants = allApplicantsFlat.map(app => {
                    const profile = candidateProfiles.get(app.candidateId);
                    return {
                        ...app,
                        candidateName: profile?.fullName || 'Unknown Candidate',
                        candidateEmail: profile?.email || 'No email',
                        candidateSkills: profile?.skills || [],
                    }
                });

                setAllApplicants(combinedApplicants.sort((a,b) => b.appliedOn.toMillis() - a.appliedOn.toMillis()));

            } catch (error) {
                console.error("Failed to fetch all applicants:", error);
                setAllApplicants([]); // Set to empty on error
            } finally {
                setLoading(false);
            }
        }

        fetchAllApplicants();

    }, [user]);

    const filteredApplicants = useMemo(() => {
        return allApplicants.filter(applicant => {
            const matchesJob = selectedJob === 'all' || applicant.postId === selectedJob;
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm.trim() === '' ||
                applicant.candidateName?.toLowerCase().includes(searchTermLower) ||
                applicant.candidateEmail?.toLowerCase().includes(searchTermLower) ||
                applicant.postTitle?.toLowerCase().includes(searchTermLower) ||
                applicant.candidateSkills?.some(skill => skill.toLowerCase().includes(searchTermLower));
            
            return matchesJob && matchesSearch;
        });
    }, [allApplicants, searchTerm, selectedJob]);

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
                            <CardDescription>Browse all candidates who have applied to your jobs and internships.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name, skill..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedJob} onValueChange={setSelectedJob}>
                                <SelectTrigger className="w-full md:w-[280px]">
                                    <SelectValue placeholder="Filter by job..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Jobs & Internships</SelectItem>
                                    {jobPosts.map(job => (
                                        <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No applicants found for the selected criteria.</p>
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
                            {filteredApplicants.map((app) => (
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
                                        <Badge variant="outline" className="mt-1 capitalize">{app.postType}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(app.appliedOn)}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{app.currentStage.replace(/_/g, ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/employer/jobs/${app.postId}/candidates/${app.candidateId}`}>View Profile</Link>
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
