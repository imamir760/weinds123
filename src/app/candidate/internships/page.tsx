'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, DocumentData } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Briefcase, Filter, Loader2, DollarSign, Clock, Building } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';

interface Internship extends DocumentData {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  stipend: string;
  match: number;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const internshipsCollectionRef = collection(db, 'internships');
    const unsubscribe = onSnapshot(internshipsCollectionRef, (snapshot) => {
      const internshipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Internship));
      setInternships(internshipsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching internships: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Internship title or keyword" className="pl-10" />
                    </div>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Location" className="pl-10" />
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
              {internships.map(internship => (
                  <Card key={internship.id}>
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <div>
                                  <CardTitle>{internship.title}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 pt-1"><Building className="w-4 h-4" /> {internship.company || 'N/A'}</CardDescription>
                              </div>
                              {internship.match && (
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary">{internship.match}% Match</p>
                                    <p className="text-xs text-muted-foreground">Compatibility Score</p>
                                </div>
                              )}
                          </div>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <div className="flex gap-x-6 gap-y-2 text-sm text-muted-foreground flex-wrap mb-4 md:mb-0">
                                  <div className="flex items-center gap-1.5">
                                      <MapPin className="h-4 w-4"/>
                                      <span>{internship.location}</span>
                                  </div>
                                   <div className="flex items-center gap-1.5">
                                      <Clock className="h-4 w-4"/>
                                      <span>{internship.duration}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <DollarSign className="h-4 w-4"/>
                                      <span>{internship.stipend}</span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <Button asChild>
                                      <Link href={`/candidate/jobs/${internship.id}`}>Apply Now</Link>
                                  </Button>
                                   <Button asChild variant="outline">
                                      <Link href={`/candidate/jobs/${internship.id}`}>View Details</Link>
                                  </Button>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
        )}
        {!loading && internships.length === 0 && (
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
