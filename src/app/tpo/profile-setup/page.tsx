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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { saveUserProfile } from '@/lib/user-actions';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';


type ProfileData = {
  institutionName: string;
  website: string;
  description: string;
  tpoName: string;
  tpoEmail: string;
};

export default function TpoProfileSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    institutionName: '',
    website: '',
    description: '',
    tpoName: '',
    tpoEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'institutes', user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setProfile(docSnap.data() as ProfileData);
            } else {
                 setProfile(prev => ({
                    ...prev, 
                    institutionName: user.displayName || '',
                    tpoEmail: user.email || ''
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
    saveUserProfile('institutes', user.uid, profile);

    toast({
      title: "Profile Saving...",
      description: "Your institution's information is being updated.",
    });

    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Request Sent",
        description: "Your profile update has been sent to the server. Redirecting to dashboard...",
      });
      router.push('/tpo/dashboard');
    }, 1500);
  };

  if (authLoading || loading) {
    return <div className="container flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Institution Profile Setup</CardTitle>
          <CardDescription>Provide details about your institution to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input id="institutionName" placeholder="e.g., Indian Institute of Technology, Bombay" value={profile.institutionName} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://iitb.ac.in" value={profile.website} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Institution</Label>
              <Textarea id="description" placeholder="Describe your institution, its key departments, and achievements." rows={5} value={profile.description} onChange={handleInputChange} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="tpoName">TPO Name</Label>
                    <Input id="tpoName" placeholder="e.g., Dr. Rajesh Kumar" value={profile.tpoName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tpoEmail">TPO Email</Label>
                    <Input id="tpoEmail" type="email" value={profile.tpoEmail} onChange={handleInputChange} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
