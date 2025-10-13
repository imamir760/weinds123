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
import { Combobox } from '@/components/ui/combobox';
import { cities } from '@/lib/cities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SkillsInput } from './skills-input';
import { allSkills } from './skills-list';

type ProfileData = {
  fullName: string;
  email: string;
  headline: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  employmentStatus: 'Fresher' | 'Working' | 'Studying';
  preference: 'Job' | 'Internship' | 'Both';
};

function CandidateProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    headline: '',
    skills: [],
    experience: '',
    education: '',
    location: '',
    employmentStatus: 'Fresher',
    preference: 'Both',
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
              const data = docSnap.data() as ProfileData;
              // Ensure skills is an array, converting from string if needed for backward compatibility
              if (typeof data.skills === 'string') {
                data.skills = (data.skills as string).split(',').map(s => s.trim()).filter(Boolean);
              }
              setProfile(data);
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
  
  const handleSelectChange = (id: keyof ProfileData, value: string) => {
    setProfile(prev => ({...prev, [id]: value}));
  }

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Combobox
                        items={cities}
                        value={profile.location}
                        onChange={(value) => handleSelectChange('location', value)}
                        placeholder="Select location..."
                        searchPlaceholder="Search cities..."
                        notFoundText="No city found."
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                     <Select value={profile.employmentStatus} onValueChange={(value) => handleSelectChange('employmentStatus', value)}>
                        <SelectTrigger id="employmentStatus">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fresher">Fresher</SelectItem>
                            <SelectItem value="Working">Working</SelectItem>
                            <SelectItem value="Studying">Studying</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="e.g., Aspiring Software Engineer | React & Node.js" value={profile.headline} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <SkillsInput
                  allSkills={allSkills}
                  selectedSkills={profile.skills}
                  onSkillsChange={(skills) => handleSelectChange('skills', skills as any)}
              />
              <p className="text-xs text-muted-foreground">This is crucial for our AI matching engine. Type a skill and press Enter to add it.</p>
            </div>

            <div className="space-y-2">
                <Label>Preference</Label>
                 <RadioGroup value={profile.preference} onValueChange={(value) => handleSelectChange('preference', value)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Job" id="pref-job" />
                        <Label htmlFor="pref-job">Job</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Internship" id="pref-internship" />
                        <Label htmlFor="pref-internship">Internship</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Both" id="pref-both" />
                        <Label htmlFor="pref-both">Both</Label>
                    </div>
                </RadioGroup>
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
