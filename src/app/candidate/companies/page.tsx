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
import { Search, Loader2, Building, Briefcase, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import CandidateDashboardLayout from '../dashboard/page';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

interface EmployerProfile extends DocumentData {
  id: string;
  companyName: string;
  tagline: string;
  industry: string;
  companySize: string;
  website: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<EmployerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const employersCollectionRef = collection(db, 'employers');
    const unsubscribe = onSnapshot(employersCollectionRef, (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmployerProfile[];
      
      setCompanies(companiesData);
      setLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: employersCollectionRef.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCompanies = companies.filter(company => 
    company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
          <CardHeader>
              <CardTitle>Hiring Companies</CardTitle>
              <CardDescription>Explore companies that are actively hiring on our platform.</CardDescription>
          </CardHeader>
        <CardContent>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by company name or industry..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <Card key={company.id}>
                 <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-lg">
                            <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{company.companyName || 'N/A'}</CardTitle>
                            <CardDescription>{company.tagline || 'N/A'}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {company.industry || 'N/A'}</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {company.companySize || 'N/A'}</div>
                </div>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={company.website || '#'} target="_blank" rel="noopener noreferrer">Visit Website</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No companies found matching your search. Try another term.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return <CandidateDashboardLayout>{PageContent}</CandidateDashboardLayout>;
}
