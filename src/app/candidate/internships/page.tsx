
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, DocumentData, query, where, getDocs } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2, DollarSign, Star, Clock, Building, PlusCircle, Sparkles, ChevronsRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { useAuth } from '@/components/auth/auth-provider';
import { matchJobCandidate } from '@/ai/flows';
import { Badge } from '@/components/ui/badge';
import { applyToAction } from '@/lib/apply-action';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface Internship extends DocumentData {
  id: string;
  title: string;
  employerId: string;
  companyName?: string;
  location: string;
  workMode: string;
  stipend: string;
  experience: string;
  skills: string;
  duration: string;
  responsibilities: string;
  pipeline: { stage: string, type?: string }[];
  matchScore?: number;
  recommendedSkills?: string[];
  justification?: string;
}

export default function InternshipsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [appliedInternships, setAppliedInternships] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const fetchAppliedInternships = async () => {
        try {
          const appliedInternshipsRef = collection(db, 'applications');
          const q = query(appliedInternshipsRef, where('candidateId', '==', user.uid), where('postType', '==', 'internship'));
          const snapshot = await getDocs(q);
          const appliedIds = snapshot.docs.map(doc => doc.data().postId);
          setAppliedInternships(appliedIds);
        } catch (error) {
          console.error("Could not fetch applied internships. This may be due to permissions and is not a fatal error.");
        }
      }
      fetchAppliedInternships();
    }
  }, [user]);

  useEffect(() => {
    const internshipsCollectionRef = collection(db, 'internships');
    const unsubscribe = onSnapshot(internshipsCollectionRef, async (snapshot) => {
      setLoading(true);
      const internshipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Internship[];
      
      const employerIds = [...new Set(internshipsData.map(internship => internship.employerId).filter(Boolean))];
      
      if (employerIds.length > 0) {
          const employerPromises = employerIds.map(id => getDoc(doc(db, 'employers', id)).catch(err => null));
          const employerSnapshots = await Promise.all(employerPromises);
          
          const employerMap = new Map<string, string>();
          employerSnapshots.forEach(snap => {
              if (snap && snap.exists()) {
                  employerMap.set(snap.id, snap.data().companyName || 'Unknown Company');
              }
          });

          const internshipsWithCompanyNames = internshipsData.map(internship => ({
              ...internship,
              companyName: employerMap.get(internship.employerId)
          }));
          setInternships(internshipsWithCompanyNames);
      } else {
          setInternships(internshipsData);
      }
      
      setLoading(false);

    }, (error) => {
      console.error("Error fetching internships:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: internshipsCollectionRef.path, operation: 'list' }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && internships.length > 0 && !matching) {
        const runMatching = async () => {
            setMatching(true);
            const candidateDocRef = doc(db, 'candidates', user.uid);
            let candidateProfile: string;

            try {
                const candidateSnap = await getDoc(candidateDocRef);
                if (!candidateSnap.exists()) {
                    console.warn("Candidate profile not found. Skipping AI matching.");
                    setMatching(false);
                    return;
                }
                candidateProfile = JSON.stringify(candidateSnap.data());
            } catch (error) {
                console.error("Failed to fetch candidate profile:", error);
                setMatching(false);
                return;
            }
            
            const internshipsToMatch = internships.filter(internship => internship.matchScore === undefined);

            for (const internship of internshipsToMatch) {
                try {
                    const jobDescription = `Title: ${internship.title}\nResponsibilities: ${internship.responsibilities}\nSkills: ${internship.skills}`;
                    const result = await matchJobCandidate({ candidateProfile, jobDescription });
                    
                    setInternships(prevInternships => 
                        prevInternships.map(i => 
                            i.id === internship.id ? { ...i, ...result } : i
                        )
                    );
                } catch (error) {
                    console.error(`Failed to get match for internship ${internship.id}`, error);
                    setInternships(prevInternships => 
                        prevInternships.map(i => 
                            i.id === internship.id ? { ...i, matchScore: -1 } : i
                        )
                    );
                }
            }

            setMatching(false);
        };
        runMatching();
    }
  }, [user, internships, matching]);

  const filteredInternships = useMemo(() => {
      if (!searchTerm) return internships;
      return internships.filter(internship => 
          internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          internship.skills?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [internships, searchTerm]);

  const getPipelineStageName = (stage: { stage: string, type?: string }) => {
    const stageName = stage.stage.replace(/_/g, ' ');
    if (stage.type) {
      const typeName = stage.type.replace(/_/g, ' ');
      return `${stageName} (${typeName})`;
    }
    return stageName;
  };
  
  const handleApply = (internship: Internship) => {
    if (user && internship.companyName) {
      applyToAction('internship', internship.id, internship.employerId, internship.title, internship.companyName, user.uid);
      setAppliedInternships(prev => [...prev, internship.id]);
      toast({
        title: "Application Sent!",
        description: `You have successfully applied for ${internship.title}.`,
      });
    } else {
       toast({
        title: "Please log in",
        description: `You need to be logged in to apply.`,
        variant: "destructive",
      });
    }
  }


  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by internship title, company, or skills..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="w-full md:w-auto">
                        <Filter className="mr-2" />
                        Search Internships
                    </Button>
                </div>
            </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
              {filteredInternships.map(internship => (
                  <Card key={internship.id} className="bg-card hover:shadow-lg transition-shadow">
                      <CardHeader>
                          <div className="flex justify-between items-start gap-4">
                              <div>
                                  <CardTitle className="text-xl font-headline">{internship.title}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 pt-1"><Building className="w-4 h-4" /> {internship.companyName || 'Loading...'}</CardDescription>
                              </div>
                              <div className="text-right flex items-center gap-3 bg-secondary p-2 rounded-lg">
                                  {internship.matchScore === undefined ? (
                                      <Loader2 className="w-5 h-5 animate-spin"/>
                                  ) : internship.matchScore === -1 ? (
                                    <span className="text-xs text-destructive">Error</span>
                                  ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-lg font-bold text-primary">{internship.matchScore}%</p>
                                            <p className="text-xs text-muted-foreground -mt-1">AI Match</p>
                                        </div>
                                    </>
                                  )}
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground flex-wrap mb-4">
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {internship.location || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {internship.workMode || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> {internship.stipend || 'Not Disclosed'}</div>
                                <div className="flex items-center gap-1.5"><Star className="h-4 w-4"/> {internship.experience || 'N/A'}</div>
                                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {internship.duration || 'N/A'}</div>
                          </div>
                          
                           {internship.responsibilities && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {internship.responsibilities}
                              </p>
                           )}

                           {internship.pipeline && internship.pipeline.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-sm mb-2">Hiring Pipeline</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {internship.pipeline.map((stage, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Badge variant="secondary" className="capitalize">{getPipelineStageName(stage)}</Badge>
                                                {index < internship.pipeline.length -1 && <ChevronsRight className="w-4 h-4 text-muted-foreground"/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                           {internship.recommendedSkills && internship.recommendedSkills.length > 0 && (
                                <div className="my-4">
                                    <h4 className="font-semibold text-sm mb-2">Recommended Skills to Add</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {internship.recommendedSkills.map(skill => (
                                           <div key={skill} className="flex items-center gap-2 bg-primary/10 pl-3 pr-1 py-1 rounded-full">
                                                <span className="text-primary text-xs font-medium">{skill.trim()}</span>
                                                <Button size="icon" variant="ghost" className="h-5 w-5 rounded-full bg-primary/20 hover:bg-primary/30">
                                                    <PlusCircle className="w-3 h-3 text-primary" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                           <div className="flex flex-col md:flex-row justify-end items-center mt-6 border-t pt-4">
                                <div className="flex gap-2">
                                    {appliedInternships.includes(internship.id) ? (
                                        <Button disabled variant="outline"><CheckCircle className="mr-2"/> Applied</Button>
                                    ) : (
                                        <Button onClick={() => handleApply(internship)} disabled={!internship.companyName}>Apply Now</Button>
                                    )}
                                     <Button asChild variant="outline">
                                        <Link href={`/candidate/internships/${internship.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
        )}
        {!loading && filteredInternships.length === 0 && (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>No internships posted yet. Check back soon!</p>
                </CardContent>
            </Card>
        )}
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
