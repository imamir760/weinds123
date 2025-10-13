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
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import CandidateDashboardLayout from '../dashboard/page';

type ProfileData = {
  fullName: string;
  email: string;
  headline: string;
  skills: string;
  experience: string;
  education: string;
};

function CandidateProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    headline: '',
    skills: '',
    experience: '',
    education: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'candidates', user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setProfile(docSnap.data() as ProfileData);
            } else {
              // Pre-fill from auth if profile doesn't exist yet
              setProfile(prev => ({
                ...prev, 
                fullName: user.displayName || '',
                email: user.email || ''
              }));
            }
        } catch(serverError) {
             const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setLoading(false);
        }
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
    
    saveUserProfile('candidates', user.uid, profile);

    toast({
      title: "Profile Saving...",
      description: "Your information is being updated.",
    });

    // Optimistic UI update
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Update Sent",
        description: "Your profile changes have been sent to the server.",
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
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Keep your profile updated to get the best job recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={profile.fullName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="e.g., Aspiring Software Engineer | React & Node.js" value={profile.headline} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea id="skills" placeholder="Enter your skills, separated by commas (e.g., JavaScript, React, Figma, SQL)" value={profile.skills} onChange={handleInputChange} />
              <p className="text-xs text-muted-foreground">This is crucial for our AI matching engine.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Textarea id="experience" placeholder="Describe your work experience." rows={5} value={profile.experience} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea id="education" placeholder="Tell us about your educational background." value={profile.education} onChange={handleInputChange} />
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


export default function CandidateProfilePage() {
    return (
        <CandidateDashboardLayout>
            <CandidateProfileContent />
        </CandidateDashboardLayout>
    )
}
