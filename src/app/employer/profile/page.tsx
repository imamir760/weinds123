'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/components/auth/auth-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { saveUserProfile } from '@/lib/user-actions';

type ProfileData = {
  companyName: string;
  website: string;
  tagline: string;
  description: string;
  industry: string;
  companySize: string;
};

export default function CompanyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    companyName: '',
    website: '',
    tagline: '',
    description: '',
    industry: '',
    companySize: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'employers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as ProfileData);
        } else {
            setProfile(prev => ({...prev, companyName: user.displayName || ''}));
        }
        setLoading(false);
      };
      fetchProfile();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    setSaving(true);
    saveUserProfile('employers', user.uid, profile);

    toast({
      title: "Profile Saving...",
      description: "Your company information is being updated.",
    });

    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Request Sent",
        description: "Your profile update has been sent to the server.",
      });
    }, 1500);
  };

   if (authLoading || loading) {
    return <div className="container flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

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
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
