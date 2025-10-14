
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import EmployerDashboardPage from '../dashboard/page';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

type Post = DocumentData & { id: string; type: 'Job' | 'Internship'; applicantCount: number; status: string; title: string, createdAt: Timestamp };

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const [showInternships, setShowInternships] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsAndApplicants = async () => {
      if (!user) {
        setLoading(false);
        return;
      };
      
      setLoading(true);
      
      try {
        const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.uid));
        const internshipsQuery = query(collection(db, "internships"), where("employerId", "==", user.uid));
        
        const [jobsSnapshot, internshipsSnapshot] = await Promise.all([
          getDocs(jobsQuery).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'jobs', operation: 'list', requestResourceData: { employerId: user.uid } }));
            return null;
          }),
          getDocs(internshipsQuery).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'internships', operation: 'list', requestResourceData: { employerId: user.uid } }));
            return null;
          })
        ]);

        const jobsData = jobsSnapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Job' } as Post)) || [];
        const internshipsData = internshipsSnapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'Internship' } as Post)) || [];
        
        let allPosts = [...jobsData, ...internshipsData];

        if (allPosts.length > 0) {
          // Firestore 'in' queries are limited to 30 items. We need to chunk the requests.
          const postIds = allPosts.map(p => p.id);
          const applicantCounts = new Map<string, number>();

          const CHUNK_SIZE = 30;
          for (let i = 0; i < postIds.length; i += CHUNK_SIZE) {
              const chunk = postIds.slice(i, i + CHUNK_SIZE);
              const applicationsQuery = query(collection(db, 'applications'), where('postId', 'in', chunk), where('employerId', '==', user.uid));
              
              const applicationsSnapshot = await getDocs(applicationsQuery).catch(serverError => {
                  const permissionError = new FirestorePermissionError({ path: 'applications', operation: 'list', requestResourceData: { postIds: chunk, employerId: user.uid } });
                  errorEmitter.emit('permission-error', permissionError);
                  return null;
              });
              
              if (applicationsSnapshot) {
                  applicationsSnapshot.docs.forEach(doc => {
                      const postId = doc.data().postId;
                      applicantCounts.set(postId, (applicantCounts.get(postId) || 0) + 1);
                  });
              }
          }

            allPosts = allPosts.map(post => ({
                ...post,
                applicantCount: applicantCounts.get(post.id) || 0
            }));
        }
        
        setPosts(allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));

      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndApplicants();
  }, [user]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => showInternships ? post.type === 'Internship' : post.type === 'Job');
  }, [posts, showInternships]);

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold font-headline">My Postings</h1>
              <CardDescription>Manage your active and inactive job listings.</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
              <Briefcase className={!showInternships ? 'text-primary' : ''}/>
              <span>Jobs</span>
            </Label>
            <Switch 
              id="post-type-toggle"
              checked={showInternships}
              onCheckedChange={setShowInternships}
            />
             <Label htmlFor="post-type-toggle" className="flex items-center gap-2 cursor-pointer">
               <GraduationCap className={showInternships ? 'text-primary' : ''}/>
              <span>Internships</span>
            </Label>
          </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{showInternships ? 'Internship' : 'Job'} Postings</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>You haven't posted any {showInternships ? 'internships' : 'jobs'} yet.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Created On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applicants</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.map(post => (
                            <TableRow key={post.id}>
                                <TableCell className="font-medium">{post.title}</TableCell>
                                <TableCell>{formatDate(post.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{post.status || 'Active'}</Badge>
                                </TableCell>
                                <TableCell>{post.applicantCount}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/employer/jobs/${post.id}`}>View Applicants</Link>
                                    </Button>
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/employer/jobs/edit/${post.id}`}>Edit</Link>
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
