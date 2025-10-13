'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TpoProfileSetupPage() {
  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Institution Profile Setup</CardTitle>
          <CardDescription>Provide details about your institution to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input id="institutionName" placeholder="e.g., Indian Institute of Technology, Bombay" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://iitb.ac.in" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Institution</Label>
              <Textarea id="description" placeholder="Describe your institution, its key departments, and achievements." rows={5} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="tpoName">TPO Name</Label>
                    <Input id="tpoName" placeholder="e.g., Dr. Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tpoEmail">TPO Email</Label>
                    <Input id="tpoEmail" type="email" placeholder="tpo@iitb.ac.in" />
                </div>
            </div>

            <div className="flex justify-end">
                <Button>Complete Setup</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
