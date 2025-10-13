
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
import { Loader2, Edit, User, MapPin, Briefcase, Target, Star, Award, Building, Share2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

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
  achievements: string;
  interestedCompanies: string;
};

function CandidateProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
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
    achievements: '',
    interestedCompanies: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'candidates', user.uid);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as ProfileData;
              if (typeof data.skills === 'string') {
                data.skills = (data.skills as string).split(',').map(s => s.trim()).filter(Boolean);
              }
              if (!Array.isArray(data.skills)) {
                data.skills = [];
              }
              setProfile(data);
            } else {
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

  useEffect(() => {
      const calculateCompleteness = () => {
          const fields = [
              profile.fullName,
              profile.headline,
              profile.location,
              profile.experience,
              profile.education,
              profile.achievements,
          ];
          const filledFields = fields.filter(Boolean).length;
          const totalFields = fields.length + (profile.skills.length > 0 ? 1 : 0);
          const completeness = Math.round((filledFields / totalFields) * 100);
          setProfileCompleteness(completeness);
      };
      calculateCompleteness();
  }, [profile]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: keyof ProfileData, value: string | string[]) => {
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

    setTimeout(() => {
      setSaving(false);
      setIsEditMode(false);
      toast({
        title: "Update Sent",
        description: "Your profile changes have been sent to the server.",
      });
    }, 1500);
  };
  
  const ProfileView = () => (
      <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-2xl shadow-primary/10 animate-fade-in">
          <div className="bg-gradient-to-br from-secondary to-background p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                      <AvatarImage src={PlaceHolderImages[1].imageUrl} alt={profile.fullName} />
                      <AvatarFallback>{profile.fullName?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                      <CardTitle className="text-3xl font-bold">{profile.fullName || 'Your Name'}</CardTitle>
                      <p className="text-primary font-medium text-lg mt-1">{profile.headline || 'Your Professional Headline'}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm mt-2">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {profile.location ? cities.find(c => c.value === profile.location)?.label : 'Location'}</span>
                          <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> {profile.employmentStatus}</span>
                          <span className="flex items-center gap-1.5"><Target className="w-4 h-4"/> Seeking: {profile.preference}</span>
                      </div>
                  </div>
                  <div className="md:ml-auto flex flex-col items-center gap-2">
                       <Button onClick={() => setIsEditMode(true)}><Edit className="mr-2"/> Edit Profile</Button>
                       <Button variant="outline" size="sm"><Share2 className="mr-2"/> Share</Button>
                  </div>
              </div>
          </div>
          <CardContent className="p-8 space-y-8">
              <div>
                  <h3 className="text-lg font-semibold mb-2">Profile Completeness</h3>
                  <Progress value={profileCompleteness} className="w-full h-3" />
                  <p className="text-sm text-muted-foreground text-center mt-2">{profileCompleteness}% complete</p>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div>
                          <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-primary"/> Skills</h3>
                          <div className="flex flex-wrap gap-2">
                              {profile.skills.length > 0 ? profile.skills.map(skill => (
                                  <div key={skill} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full animate-pop-in">
                                      {skill}
                                  </div>
                              )) : <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                          </div>
                      </div>
                       <div>
                          <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><Building className="w-5 h-5 text-primary"/> Interested Companies</h3>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{profile.interestedCompanies || 'Add companies you are interested in.'}</p>
                      </div>
                  </div>
                   <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-primary"/> Achievements</h3>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{profile.achievements || 'No achievements listed.'}</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Experience</h3>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{profile.experience || 'No experience listed.'}</p>
                      </div>
                       <div>
                          <h3 className="font-semibold text-xl mb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary"/> Education</h3>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{profile.education || 'No education listed.'}</p>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
  );

  const ProfileForm = () => (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Update Your Profile</CardTitle>
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
              <p className="text-xs text-muted-foreground">Type a skill and press Enter to add it.</p>
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

            <div className="space-y-2">
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea id="achievements" placeholder="List any awards, publications, or notable projects." value={profile.achievements} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="interestedCompanies">Interested Companies</Label>
                <Textarea id="interestedCompanies" placeholder="List companies you'd love to work for, one per line." value={profile.interestedCompanies} onChange={handleInputChange} />
            </div>


            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        {authLoading || loading ? (
             <div className="container flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
            isEditMode ? <ProfileForm /> : <ProfileView />
        )}
    </div>
  );

    return (
        <CandidateDashboardLayout>
            {PageContent}
        </CandidateDashboardLayout>
    )
}

export default CandidateProfilePage;
