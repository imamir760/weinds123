
'use client';

import { useState, useEffect, use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, GraduationCap, Star, FolderKanban, BookOpen, UserCircle, Github, Linkedin, Mail, Phone, MapPin, TestTube2, FileUp, Send, CheckCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import EmployerDashboardPage from '@/app/employer/dashboard/page';
import { db } from '@/lib/firebase';
import { doc, getDoc, DocumentData, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateSkillTest } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

type CandidateProfile = DocumentData & {
  id: string;
  fullName: string;
  email: string;
  headline: string;
  skills: string[];
  experience: { jobTitle: string; company: string; duration: string; }[];
  education: { institution:string; degree: string; year: string; }[];
  location: string;
  employmentStatus: string;
  preference: string;
  achievements: { description: string; }[];
  projects: { title: string; url: string; description: string; }[];
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
};

type JobDetails = DocumentData & {
  title: string;
  responsibilities: string;
  skills: string;
  pipeline: { stage: string, type?: string }[];
};


const ProfileOverview = ({ profile }: { profile: CandidateProfile }) => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <UserCircle className="w-24 h-24 text-primary shrink-0"/>
                    <div className="flex-grow">
                        <CardTitle className="text-3xl font-headline">{profile.fullName}</CardTitle>
                        <CardDescription className="text-lg">{profile.headline}</CardDescription>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-3">
                            {profile.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/>{profile.location}</div>}
                            {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-primary"><Mail className="w-4 h-4"/>{profile.email}</a>}
                            {profile.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4"/>{profile.phone}</div>}
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            {profile.githubUrl && <Button variant="outline" asChild size="sm"><Link href={profile.githubUrl} target="_blank"><Github className="mr-2" /> GitHub</Link></Button>}
                            {profile.linkedinUrl && <Button variant="outline" asChild size="sm"><Link href={profile.linkedinUrl} target="_blank"><Linkedin className="mr-2" /> LinkedIn</Link></Button>}
                            {profile.portfolioUrl && <Button variant="outline" asChild size="sm"><Link href={profile.portfolioUrl} target="_blank"><FolderKanban className="mr-2" /> Portfolio</Link></Button>}
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>

         <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary"/> Skills</CardTitle></CardHeader>
            <CardContent>
                {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                ) : <p className="text-muted-foreground">No skills listed.</p>}
            </CardContent>
        </Card>

         <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Work Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {profile.experience && profile.experience.length > 0 ? profile.experience.map((exp, i) => (
                    <div key={i} className={i !== profile.experience.length - 1 ? "pb-4 border-b" : ""}>
                        <p className="font-semibold">{exp.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                    </div>
                )) : <p className="text-muted-foreground">No work experience listed.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary"/> Education</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {profile.education && profile.education.length > 0 ? profile.education.map((edu, i) => (
                   <div key={i} className={i !== profile.education.length - 1 ? "pb-4 border-b" : ""}>
                        <p className="font-semibold">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                    </div>
                )) : <p className="text-muted-foreground">No education listed.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5 text-primary"/> Projects</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               {profile.projects && profile.projects.length > 0 ? profile.projects.map((proj, i) => (
                    <div key={i} className={i !== profile.projects.length - 1 ? "pb-4 border-b" : ""}>
                         <a href={proj.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary hover:underline">{proj.title}</a>
                         <p className="text-sm text-muted-foreground mt-1">{proj.description}</p>
                     </div>
                 )) : <p className="text-muted-foreground">No projects listed.</p>}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary"/> Achievements</CardTitle></CardHeader>
            <CardContent>
                {profile.achievements && profile.achievements.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {profile.achievements.map((ach, i) => (
                      <li key={i}>{ach.description}</li>
                    ))}
                  </ul>
                ) : <p className="text-muted-foreground">No achievements listed.</p>}
            </CardContent>
        </Card>
    </div>
);

const SkillTestTab = ({ profile, jobDetails, postId }: { profile: CandidateProfile, jobDetails: JobDetails, postId: string }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [testSent, setTestSent] = useState(false);
    
    const pipeline = jobDetails.pipeline || [];
    const skillTestStage = pipeline.find(p => p.stage === 'skill_test');

    const handleSendAiTest = async () => {
        setLoading(true);
        try {
            const jobDescription = `Title: ${jobDetails.title}\nResponsibilities: ${jobDetails.responsibilities}\nSkills: ${jobDetails.skills}`;
            const questions = await generateSkillTest({ jobDescription, candidateSkills: profile.skills || [] });

            const testData = {
                title: `${jobDetails.title} - Skill Test`,
                postId: postId,
                postType: 'job',
                employerId: jobDetails.employerId,
                duration: 60,
                createdAt: serverTimestamp(),
                questions: questions.questions,
                candidateId: profile.id,
                status: 'pending',
                companyName: jobDetails.companyName,
            };

            const skillTestsCollectionRef = collection(db, 'skill_tests');
            addDoc(skillTestsCollectionRef, testData).catch(serverError => {
              const permissionError = new FirestorePermissionError({
                  path: '/skill_tests',
                  operation: 'create',
                  requestResourceData: testData,
              });
              errorEmitter.emit('permission-error', permissionError);
            });

            toast({ title: "Success", description: "AI Skill Test has been generated and sent to the candidate." });
            setTestSent(true);
        } catch (error) {
            console.error("Failed to generate or send AI test:", error);
            toast({ title: "Error", description: "Could not send the AI test.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!skillTestStage) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <TestTube2 className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Skill Test Stage Not Configured</h3>
                    <p>This hiring pipeline does not include a skill test stage.</p>
                </CardContent>
            </Card>
        );
    }
    
    if (skillTestStage.type === 'ai') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Skill Test</CardTitle>
                    <CardDescription>Generate and send a unique test based on the job and candidate profile.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {testSent ? (
                        <div className='py-8'>
                             <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                            <p className="font-semibold text-lg">Test Sent!</p>
                            <p className="text-muted-foreground">The candidate has been notified.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-4">Click below to generate and send a 20-question test to {profile.fullName}.</p>
                            <Button onClick={handleSendAiTest} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                Send AI Generated Test
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (skillTestStage.type === 'traditional') {
        return (
            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Send Traditional Test</CardTitle>
                        <CardDescription>Upload your test file to send to the candidate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                           <Label htmlFor="test-file">Test Document (.zip, .pdf)</Label>
                           <Input id="test-file" type="file" />
                       </div>
                       <Button className="w-full"><UploadCloud className="mr-2"/> Upload & Send</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Candidate Submission</CardTitle>
                        <CardDescription>Review the candidate's submitted test here.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground py-12">
                       <p>Awaiting submission...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return null; // Should not be reached
}


export default function CandidateDetailsPage({ params }: { params: { id: string; candidateId: string } }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPageData = async () => {
      if (!resolvedParams.candidateId || !resolvedParams.id) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch candidate profile
        const candidateRef = doc(db, 'candidates', resolvedParams.candidateId);
        const candidateSnap = await getDoc(candidateRef);
        if (candidateSnap.exists()) {
          setProfile({ id: candidateSnap.id, ...candidateSnap.data() } as CandidateProfile);
        } else {
          throw new Error("Candidate profile not found.");
        }

        // Fetch job/internship details
        let postSnap;
        const jobRef = doc(db, 'jobs', resolvedParams.id);
        postSnap = await getDoc(jobRef);
        if (!postSnap.exists()) {
            const internshipRef = doc(db, 'internships', resolvedParams.id);
            postSnap = await getDoc(internshipRef);
        }
        if (postSnap.exists()){
            setJobDetails(postSnap.data() as JobDetails);
        } else {
            throw new Error("Job/Internship details not found.");
        }

      } catch (err: any) {
        setError(err.message || "Failed to load data.");
        if (err.name !== 'FirestorePermissionError') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `candidates/${resolvedParams.candidateId} or jobs/${resolvedParams.id}`,
            operation: 'get',
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [resolvedParams.candidateId, resolvedParams.id]);

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href={`/employer/jobs/${resolvedParams.id}`}><ArrowLeft className="mr-2" /> Back to Applicants</Link>
            </Button>
        </div>

        {loading ? (
            <Card>
                <CardContent className="h-96 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        ) : error ? (
            <Card>
                <CardContent className="py-12 text-center text-destructive">
                    <p className="font-semibold text-lg">{error}</p>
                </CardContent>
            </Card>
        ) : profile && jobDetails && (
            <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="skill-test">Skill Test</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <ProfileOverview profile={profile} />
                </TabsContent>
                <TabsContent value="skill-test">
                    <SkillTestTab profile={profile} jobDetails={jobDetails} postId={resolvedParams.id} />
                </TabsContent>
            </Tabs>
        )}
      </div>
    </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
