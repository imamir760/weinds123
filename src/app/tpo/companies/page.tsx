'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, PlusCircle } from 'lucide-react';

const companies = [
    { id: 'comp1', name: 'TechCorp', industry: 'SaaS', drives: 3 },
    { id: 'comp2', name: 'Innovate LLC', industry: 'FinTech', drives: 1 },
    { id: 'comp3', name: 'DesignHub', industry: 'Creative Agency', drives: 2 },
];

export default function TpoCompaniesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Partner Companies</h1>
                <p className="text-muted-foreground">Manage relationships with your hiring partners.</p>
            </div>
             <Button>
                <PlusCircle className="mr-2" /> Add Company
            </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Company Network</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    {company.name}
                </CardTitle>
                <CardDescription>{company.industry}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{company.drives} drives conducted</p>
                <Button variant="outline" size="sm" className="mt-4">View History</Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
