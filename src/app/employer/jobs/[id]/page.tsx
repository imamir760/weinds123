
'use client';

import React, { useState, useEffect, useCallback, use, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData, query, where, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Star, Mail, ThumbsUp, ThumbsDown, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { matchJobCandidate, MatchJobCandidateOutput } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type PostDetails = DocumentData & {
  id: string;
  title: string;
  type: 'job' | 'internship';
  employerId?: string;
  responsibilities: string;
  skills: string;
};

type Applicant = DocumentData & {
  id: string; // This is the candidate's UID
  applicationId: string;
  candidateId: string;
  status: string;
  candidateName: string;
  candidateHeadline: string;
  candidateEmail: string;
  candidateSkills: string[];
  avatar?: string;
  matchScore?: number;
  justification?: string;
};

export default function ViewApplicantsPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const { toast } = useToast();
  
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [matching, setMatching] = useState(false);
  const [filter, setFilter] = useState<'Applied' | 'Shortlisted' | 'Rejected'>('Applied');

  const fetchPostAndApplicants = useCallback(async (currentUser: FirebaseUser) => {
    setLoading(true);

    try {
        let postSnap;
        let postType: 'job' | 'internship' | null = null;
        const jobRef = doc(db, 'jobs', postId);
        postSnap = await getDoc(jobRef);
        if (postSnap.exists()) {
            postType = 'job';
        } else {
            const internshipRef = doc(db, 'internships', postId);
            postSnap = await getDoc(internshipRef);
            if (postSnap.exists()) postType = 'internship';
        }

        if (!postSnap.exists() || !postType) {
            setPostDetails(null);
            setIsOwner(false);
            setLoading(false);
            return;
        }

        const postData = { id: postSnap.id, ...postSnap.data(), type: postType } as PostDetails;
        setPostDetails(postData);

        const owner = currentUser.uid === postData.employerId;
        setIsOwner(owner);
        if (!owner) {
            setLoading(false);
            return;
        }

        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('postId', '==', postId), where('employerId', '==', currentUser.uid));
        
        let applicationsSnap;
        try {
            applicationsSnap = await getDocs(q);
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({ path: 'applications', operation: 'list', requestResourceData: {postId, employerId: currentUser.uid} });
             errorEmitter.emit('permission-error', permissionError);
             throw permissionError;
        }

        const applicationsData = applicationsSnap.docs.map(doc => ({
            applicationId: doc.id,
            ...(doc.data() as Omit<Applicant, 'applicationId'>)
        }));
        
        const candidatePromises = applicationsData.map(app => 
            getDoc(doc(db, 'candidates', app.candidateId)).catch(serverError => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `/candidates/${app.candidateId}`, operation: 'get' }));
                return null;
            })
        );
        const candidateSnapshots = await Promise.all(candidatePromises);

        const fullApplicantsData = applicationsData.map((app, index) => {
            const candidateSnap = candidateSnapshots[index];
            const profileData = candidateSnap?.exists() ? candidateSnap.data() : {};
            return {
                id: app.candidateId,
                applicationId: app.applicationId,
                status: app.status || 'Applied',
                candidateId: app.candidateId,
                candidateName: profileData.fullName || app.candidateName || 'Unknown Candidate',
                candidateHeadline: profileData.headline || app.candidateHeadline || 'No headline',
                candidateEmail: profileData.email || app.candidateEmail || 'No email',
                candidateSkills: profileData.skills || app.candidateSkills || [],
                avatar: (profileData.fullName || app.candidateName || 'U').charAt(0),
            } as Applicant
        });
        
        setApplicants(fullApplicantsData);
        setLoading(false);
        setMatching(true);
        
        const jobDescription = `Title: ${postData.title}\nResponsibilities: ${postData.responsibilities}\nSkills: ${postData.skills}`;
        
        for (const applicant of fullApplicantsData) {
          try {
            const candidateProfileString = `
              Full Name: ${applicant.candidateName}
              Headline: ${applicant.candidateHeadline}
              Skills: ${applicant.candidateSkills.join(', ')}
            `;
            const matchResult: MatchJobCandidateOutput = await matchJobCandidate({
              candidateProfile: candidateProfileString,
              jobDescription,
            });
            
            setApplicants(prev => prev.map(a => a.id === applicant.id ? {...a, ...matchResult} : a));

          } catch (error) {
            console.error(`AI matching failed for ${applicant.candidateName}:`, error);
            setApplicants(prev => prev.map(a => a.id === applicant.id ? {...a, matchScore: -1} : a));
          }
        }
        setMatching(false);

    } catch (error) {
        console.error("An error occurred during data fetching:", error);
        setLoading(false);
        setMatching(false);
    }
  }, [postId]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPostAndApplicants(currentUser);
      } else {
        setIsOwner(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchPostAndApplicants]);
  
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => app.status === filter);
  }, [applicants, filter]);


  const handleUpdateStatus = async (applicationId: string, newStatus: 'Shortlisted' | 'Rejected' | 'Applied') => {
      const appRef = doc(db, 'applications', applicationId);
      try {
          await updateDoc(appRef, { status: newStatus });
          setApplicants(prev => prev.map(app => app.applicationId === applicationId ? {...app, status: newStatus} : app));
          toast({
              title: "Status Updated",
              description: `Candidate has been moved to ${newStatus}.`
          });
      } catch (error) {
          console.error("Failed to update status", error);
          toast({
              title: "Update Failed",
              description: "Could not update candidate status.",
              variant: "destructive"
          });
           errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: appRef.path,
                operation: 'update',
                requestResourceData: { status: newStatus }
           }));
      }
  }

  const PageContent = (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Postings</Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{postDetails?.title || 'Loading...'}</h1>
                <p className="text-sm text-muted-foreground">Applicants</p>
            </div>
        </div>

        <Card className="mb-6">
            <CardContent className="p-3">
                 <div className="flex gap-2">
                    <Button variant={filter === 'Applied' ? 'default' : 'ghost'} onClick={() => setFilter('Applied')}>Applied</Button>
                    <Button variant={filter === 'Shortlisted' ? 'default' : 'ghost'} onClick={() => setFilter('Shortlisted')}>Shortlisted</Button>
                    <Button variant={filter === 'Rejected' ? 'destructive' : 'ghost'} onClick={() => setFilter('Rejected')}>Rejected</Button>
                 </div>
            </CardContent>
        </Card>

        {loading ? (
            <Card>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        ) : isOwner === false ? (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="font-semibold text-lg text-destructive">Access Denied</p>
                    <p className="text-muted-foreground mt-2">You do not have permission to view the applicants for this post.</p>
                </CardContent>
            </Card>
        ) : filteredApplicants.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No applicants in the "{filter}" stage.</p>
                </CardContent>
             </Card>
        ) : (
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredApplicants.map(applicant => (
                      <Card key={applicant.id} className="flex flex-col text-sm">
                          <CardHeader className="flex flex-row items-start gap-3 p-4">
                              <Avatar className="w-10 h-10">
                                  <AvatarFallback>{applicant.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <Link href={`/employer/jobs/${postDetails?.id}/candidates/${applicant.id}`}>
                                    <CardTitle className="text-base hover:underline">{applicant.candidateName}</CardTitle>
                                  </Link>
                                  <CardDescription className="text-xs">{applicant.candidateHeadline}</CardDescription>
                                  <a href={`mailto:${applicant.candidateEmail}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5">
                                      <Mail className="w-3 h-3"/> {applicant.candidateEmail}
                                  </a>
                              </div>
                               {applicant.matchScore !== undefined ? (
                                    applicant.matchScore === -1 ? <Badge variant="destructive" className="text-xs">Error</Badge> :
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 text-primary cursor-pointer">
                                                <Star className="w-4 h-4"/>
                                                <span className="font-bold text-base">{applicant.matchScore}%</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs text-xs">{applicant.justification || "AI Match Score"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : ( matching && <Loader2 className="w-4 h-4 animate-spin"/> )}
                          </CardHeader>
                          <CardContent className="flex-grow space-y-3 px-4 pb-3">
                              <div>
                                  <h4 className="text-xs font-semibold mb-1.5">Skills</h4>
                                  <div className="flex flex-wrap gap-1">
                                      {(applicant.candidateSkills || []).slice(0, 4).map(skill => (
                                          <Badge key={skill} variant="secondary" className="text-xs font-normal">{skill}</Badge>
                                      ))}
                                      {(applicant.candidateSkills?.length || 0) > 4 && <Badge variant="outline" className="text-xs font-normal">+{ (applicant.candidateSkills?.length || 0) - 4} more</Badge>}
                                  </div>
                              </div>
                          </CardContent>
                          <CardFooter className="bg-secondary/30 p-2 flex justify-end gap-2">
                             {filter === 'Applied' && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8" onClick={() => handleUpdateStatus(applicant.applicationId, 'Rejected')}>
                                      <ThumbsDown className="mr-1.5 w-3.5 h-3.5"/> Reject
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8" onClick={() => handleUpdateStatus(applicant.applicationId, 'Shortlisted')}>
                                      <ThumbsUp className="mr-1.5 w-3.5 h-3.5"/> Shortlist
                                  </Button>
                                </>
                             )}
                             {filter === 'Shortlisted' && (
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => handleUpdateStatus(applicant.applicationId, 'Rejected')}>
                                    <ThumbsDown className="mr-1.5 w-3.5 h-3.5"/> Reject
                                </Button>
                             )}
                              {filter === 'Rejected' && (
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => handleUpdateStatus(applicant.applicationId, 'Applied')}>
                                    <Undo2 className="mr-1.5 w-3.5 h-3.5"/> Reconsider
                                </Button>
                             )}
                          </CardFooter>
                      </Card>
                  ))}
              </div>
            </TooltipProvider>
        )}
      </div>
  );

  return <>{PageContent}</>;
}

    
