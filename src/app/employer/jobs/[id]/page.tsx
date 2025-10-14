
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, DocumentData, query, where, updateDoc } from 'firebase/firestore';
import EmployerDashboardPage from '../../dashboard/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Star, User, Mail, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  const postId = use(params);
  const { toast } = useToast();
  
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [matching, setMatching] = useState(false);

  const fetchPostAndApplicants = useCallback(async (currentUser: FirebaseUser) => {
    setLoading(true);

    try {
        let postSnap;
        let postType: 'job' | 'internship' | null = null;
        const jobRef = doc(db, 'jobs', postId.id);
        postSnap = await getDoc(jobRef);
        if (postSnap.exists()) {
            postType = 'job';
        } else {
            const internshipRef = doc(db, 'internships', postId.id);
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
        const q = query(applicationsRef, where('postId', '==', postId.id), where('employerId', '==', currentUser.uid));
        
        let applicationsSnap;
        try {
            applicationsSnap = await getDocs(q);
        } catch (serverError) {
             const permissionError = new FirestorePermissionError({ path: 'applications', operation: 'list', requestResourceData: {postId: postId.id, employerId: currentUser.uid} });
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
        
        // Run AI matching in the background
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

  const PageContent = (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/employer/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Postings</Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{postDetails?.title || 'Loading...'}</h1>
                <p className="text-sm text-muted-foreground">Applicants</p>
            </div>
        </div>

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
        ) : !applicants || applicants.length === 0 ? (
             <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No applicants for this post yet.</p>
                </CardContent>
             </Card>
        ) : (
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applicants.map(applicant => (
                      <Card key={applicant.id} className="flex flex-col">
                          <CardHeader className="flex flex-row items-start gap-4 pb-4">
                              <Avatar className="w-12 h-12">
                                  <AvatarFallback>{applicant.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <Link href={`/employer/jobs/${postDetails?.id}/candidates/${applicant.id}`}>
                                    <CardTitle className="text-lg hover:underline">{applicant.candidateName}</CardTitle>
                                  </Link>
                                  <CardDescription>{applicant.candidateHeadline}</CardDescription>
                                  <a href={`mailto:${applicant.candidateEmail}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                                      <Mail className="w-3 h-3"/> {applicant.candidateEmail}
                                  </a>
                              </div>
                               {applicant.matchScore !== undefined ? (
                                    applicant.matchScore === -1 ? <Badge variant="destructive">Error</Badge> :
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1.5 text-primary cursor-pointer">
                                                <Star className="w-5 h-5"/>
                                                <span className="font-bold text-lg">{applicant.matchScore}%</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{applicant.justification || "AI Match Score"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : ( matching && <Loader2 className="w-5 h-5 animate-spin"/> )}
                          </CardHeader>
                          <CardContent className="flex-grow space-y-4">
                              <div>
                                  <h4 className="text-sm font-semibold mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-1">
                                      {(applicant.candidateSkills || []).slice(0, 5).map(skill => (
                                          <Badge key={skill} variant="secondary">{skill}</Badge>
                                      ))}
                                      {(applicant.candidateSkills?.length || 0) > 5 && <Badge variant="outline">+{ (applicant.candidateSkills?.length || 0) - 5} more</Badge>}
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
            </TooltipProvider>
        )}
      </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
