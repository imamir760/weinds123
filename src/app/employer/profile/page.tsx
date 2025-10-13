'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

type ProfileData = {
  companyName: string;
  website: string;
  tagline: string;
  description: string;
  industry: string;
  companySize: string;
};

const staticProfile: ProfileData = {
    companyName: 'Innovate LLC',
    website: 'https://innovate.llc',
    tagline: 'Building the Future of Technology',
    description: 'We are a forward-thinking technology company focused on creating innovative solutions that solve real-world problems. Our culture is collaborative, fast-paced, and dedicated to excellence.',
    industry: 'SaaS',
    companySize: '50-200 employees',
};


export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(staticProfile);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log("Saving profile (static):", profile);
    // In a real scenario, this would save to a backend.
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>This information will be visible to candidates on your job posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={profile.companyName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={profile.website} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" placeholder="e.g., Building the future of technology" value={profile.tagline} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Company</Label>
              <Textarea id="description" placeholder="Describe your company, culture, and mission." rows={5} value={profile.description} onChange={handleInputChange} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="e.g., SaaS, E-commerce" value={profile.industry} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input id="companySize" placeholder="e.g., 50-200 employees" value={profile.companySize} onChange={handleInputChange} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={true}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes (Disabled)
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
