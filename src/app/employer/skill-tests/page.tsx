
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
import { Briefcase, Loader2, GraduationCap, TestTube2, FilePlus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import EmployerLayout from '../layout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Post = DocumentData & { id: string; type: 'Job' | 'Internship'; title: string, createdAt: Timestamp };

export default function SkillTestsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternships, setShowInternships] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
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
        setPosts(allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));

      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><TestTube2 className="w-8 h-8" /> Skill Tests</h1>
              <CardDescription>Create and manage skill assessments for your job and internship postings.</CardDescription>
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
            <CardTitle>Your {showInternships ? 'Internship' : 'Job'} Postings</CardTitle>
            <CardDescription>Select a posting to create or view its skill tests.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>You haven't created any {showInternships ? 'internships' : 'job'} postings yet.</p>
                     <Button variant="link" asChild>
                        <Link href="/employer/jobs">Go to My Postings</Link>
                     </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.map(post => (
                            <TableRow key={post.id}>
                                <TableCell className="font-medium">{post.title}</TableCell>
                                <TableCell>
                                    <Badge variant={post.type === 'Job' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                                      {post.type === 'Job' ? <Briefcase className="w-3 h-3"/> : <GraduationCap className="w-3 h-3"/>}
                                      {post.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{formatDate(post.createdAt)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/employer/skill-tests/${post.id}/view`}>
                                          <Eye className="mr-2 h-3 w-3"/>
                                          View Tests
                                        </Link>
                                    </Button>
                                     <Button asChild size="sm">
                                        <Link href={`/employer/skill-tests/${post.id}/create`}>
                                          <FilePlus className="mr-2 h-3 w-3"/>
                                          Create Test
                                        </Link>
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

  return <EmployerLayout>{PageContent}</EmployerLayout>
}
