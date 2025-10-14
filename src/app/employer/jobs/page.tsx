'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase, Users, MoreVertical, Loader2, GraduationCap } from 'lucide-react';
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

type Post = DocumentData & { id: string, type: 'Job' | 'Internship', applicantCount: number };

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
          getDocs(jobsQuery),
          getDocs(internshipsQuery)
        ]);

        const processPosts = async (snapshot: DocumentData, type: 'Job' | 'Internship'): Promise<Post[]> => {
          const postsData = snapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() }));
          
          const postsWithCounts = await Promise.all(
            postsData.map(async (post: DocumentData) => {
              const collectionName = type === 'Job' ? 'jobs' : 'internships';
              const applicantsRef = collection(db, collectionName, post.id, 'applicants');
              const applicantsSnap = await getDocs(applicantsRef);
              return { ...post, type, applicantCount: applicantsSnap.size };
            })
          );
          return postsWithCounts;
        }

        const jobsData = await processPosts(jobsSnapshot, 'Job');
        const internshipsData = await processPosts(internshipsSnapshot, 'Internship');
        
        setPosts([...jobsData, ...internshipsData]);

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

  const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'MMM d, yyyy');
  }

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold font-headline">Job Postings</h1>
              <p className="text-muted-foreground">Manage your active and inactive job listings.</p>
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
                                        <Link href={`/employer/jobs/${post.id}`}>View Pipeline</Link>
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
