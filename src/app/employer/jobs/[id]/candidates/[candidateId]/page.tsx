
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, GraduationCap, Star, FolderKanban, BookOpen, UserCircle, Github, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import EmployerDashboardPage from '@/app/employer/dashboard/page';
import { db } from '@/lib/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type CandidateProfile = DocumentData & {
  fullName: string;
  email: string;
  headline: string;
  skills: string[];
  experience: { jobTitle: string; company: string; duration: string; }[];
  education: { institution: string; degree: string; year: string; }[];
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

export default function CandidateDetailsPage({ params }: { params: { id: string; candidateId: string } }) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const docRef = doc(db, 'candidates', params.candidateId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as CandidateProfile);
        } else {
          setError("Candidate profile not found.");
        }
      } catch (serverError: any) {
        setError("Failed to load profile. You may not have permission to view this.");
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        setLoading(false);
      }
    };

    if (params.candidateId) {
      fetchProfile();
    }
  }, [params.candidateId]);

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href={`/employer/jobs/${params.id}`}><ArrowLeft className="mr-2" /> Back to Applicants</Link>
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
        ) : profile && (
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
        )}
      </div>
    </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}

    