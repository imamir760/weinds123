'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CompanyProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>This information will be visible to candidates on your job posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="TechCorp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" defaultValue="https://techcorp.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" placeholder="e.g., Building the future of technology" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Company</Label>
              <Textarea id="description" placeholder="Describe your company, culture, and mission." rows={5} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="e.g., SaaS, E-commerce" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input id="companySize" placeholder="e.g., 50-200 employees" />
                </div>
            </div>

            <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
