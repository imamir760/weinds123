
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
import { Loader2, UserCircle, Settings, Star, FolderKanban, Save, GraduationCap, Briefcase, PlusCircle, BookOpen } from 'lucide-react';
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
import { ExperienceCard } from './experience-card';
import { EducationCard } from './education-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export type Experience = {
  jobTitle: string;
  company: string;
  duration: string;
}

export type Education = {
  institution: string;
  degree: string;
  year: string;
}

type ProfileData = {
  fullName: string;
  email: string;
  headline: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  location: string;
  employmentStatus: 'Fresher' | 'Working' | 'Studying';
  preference: 'Job' | 'Internship' | 'Both';
  achievements: string;
  projects: string;
  phone?: string;
};

function CandidateProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    headline: '',
    skills: [],
    experience: [],
    education: [],
    location: '',
    employmentStatus: 'Fresher',
    preference: 'Both',
    achievements: '',
    projects: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
              if (!Array.isArray(data.skills)) data.skills = [];
              if (!Array.isArray(data.experience)) data.experience = [];
              if (!Array.isArray(data.education)) data.education = [];
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
              profile.achievements,
              profile.projects,
              profile.phone
          ];
          const filledFields = fields.filter(Boolean).length;
          const totalFields = fields.length + (profile.skills.length > 0 ? 1 : 0) + (profile.experience.length > 0 ? 1 : 0) + (profile.education.length > 0 ? 1 : 0);
          const completeness = Math.round((filledFields / (fields.length + 3)) * 100);
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

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setProfile(prev => {
        const newExperience = [...prev.experience];
        newExperience[index] = { ...newExperience[index], [field]: value };
        return { ...prev, experience: newExperience };
    });
  };

  const addExperience = () => {
    setProfile(prev => ({
        ...prev,
        experience: [...prev.experience, { jobTitle: '', company: '', duration: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setProfile(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
     setProfile(prev => {
        const newEducation = [...prev.education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        return { ...prev, education: newEducation };
    });
  };

  const addEducation = () => {
    setProfile(prev => ({
        ...prev,
        education: [...prev.education, { institution: '', degree: '', year: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
    }));
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

    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      toast({
        title: "Update Sent",
        description: "Your profile changes have been sent to the server.",
      });
    }, 1500);
  };
  

  const ProfileForm = () => (
    <form className="space-y-6" onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle className="w-5 h-5 text-primary" /> Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={profile.fullName} onChange={handleInputChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="e.g., Aspiring Software Engineer" value={profile.headline} onChange={handleInputChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled />
            </div>
             <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={profile.phone} onChange={handleInputChange} />
            </div>
          </div>
           <div className="space-y-1">
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
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Preference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
                <Label>I am a</Label>
                 <Select value={profile.employmentStatus} onValueChange={(value) => handleSelectChange('employmentStatus', value)}>
                    <SelectTrigger id="employmentStatus">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fresher">Fresher</SelectItem>
                        <SelectItem value="Working">Working Professional</SelectItem>
                        <SelectItem value="Studying">Currently Studying</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>I'm looking for</Label>
                 <RadioGroup value={profile.preference} onValueChange={(value) => handleSelectChange('preference', value as any)} className="flex gap-4 pt-2">
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
        </CardContent>
      </Card>
      

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsInput
            allSkills={allSkills}
            selectedSkills={profile.skills}
            onSkillsChange={(skills) => handleSelectChange('skills', skills as any)}
          />
          <p className="text-xs text-muted-foreground mt-2">Type a skill and press Enter to add it. Previously added custom skills will appear in suggestions.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {profile.experience.map((exp, index) => (
                <ExperienceCard 
                    key={index}
                    index={index}
                    experience={exp}
                    updateExperience={updateExperience}
                    removeExperience={removeExperience}
                />
            ))}
            <Button variant="outline" onClick={addExperience} type="button" className="w-full">
                <PlusCircle className="mr-2"/>
                Add Experience
            </Button>
        </CardContent>
      </Card>


      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {profile.education.map((edu, index) => (
                <EducationCard 
                    key={index}
                    index={index}
                    education={edu}
                    updateEducation={updateEducation}
                    removeEducation={removeEducation}
                />
            ))}
            <Button variant="outline" onClick={addEducation} type="button" className="w-full">
                <PlusCircle className="mr-2"/>
                Add Education
            </Button>
          </CardContent>
      </Card>

      <Card>
           <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5 text-primary"/> Accomplishments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="projects">Projects</Label>
                <Textarea id="projects" placeholder="List your projects, including any relevant links to GitHub or live demos." value={profile.projects} onChange={handleInputChange} />
            </div>
            <div className="space-y-1">
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea id="achievements" placeholder="List any awards, publications, or notable accomplishments." value={profile.achievements} onChange={handleInputChange} />
            </div>
          </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
          Save Profile
        </Button>
      </div>
    </form>
  );

  const ProfileView = () => (
    <div className="space-y-8">
        <Card className="shadow-lg">
            <CardHeader className="bg-secondary rounded-t-lg p-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <UserCircle className="w-16 h-16 text-primary" />
                        <div>
                            <CardTitle className="text-3xl">{profile.fullName || "Your Name"}</CardTitle>
                            <CardDescription className="text-lg">{profile.headline || "Your Professional Headline"}</CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <Label>Profile Completeness</Label>
                        <div className="w-64 mt-1 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                           <div className="bg-primary h-2.5 rounded-full" style={{width: `${profileCompleteness}%`}}></div>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{profileCompleteness}% Complete</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4">
                    <div><Label>Location:</Label> <p>{profile.location || 'N/A'}</p></div>
                    <div><Label>Status:</Label> <p>{profile.employmentStatus || 'N/A'}</p></div>
                    <div><Label>Preference:</Label> <p>{profile.preference || 'N/A'}</p></div>
                </div>
            </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={['skills', 'experience', 'education']} className="w-full space-y-4">
            <Card>
                <AccordionItem value="skills">
                    <AccordionTrigger className="p-6 font-semibold text-lg flex items-center gap-2"><Star className="w-5 h-5 text-primary"/> Skills</AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                         {profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                            </div>
                         ) : <p className="text-muted-foreground">No skills added yet.</p>}
                    </AccordionContent>
                </AccordionItem>
            </Card>

            <Card>
                 <AccordionItem value="experience">
                    <AccordionTrigger className="p-6 font-semibold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Work Experience</AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 space-y-4">
                         {profile.experience.length > 0 ? profile.experience.map((exp, i) => (
                             <div key={i} className="p-3 border-b">
                                 <p className="font-semibold">{exp.jobTitle}</p>
                                 <p className="text-sm">{exp.company}</p>
                                 <p className="text-xs text-muted-foreground">{exp.duration}</p>
                             </div>
                         )) : <p className="text-muted-foreground">No experience added yet.</p>}
                    </AccordionContent>
                </AccordionItem>
            </Card>
            
            <Card>
                 <AccordionItem value="education">
                    <AccordionTrigger className="p-6 font-semibold text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary"/> Education</AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 space-y-4">
                         {profile.education.length > 0 ? profile.education.map((edu, i) => (
                            <div key={i} className="p-3 border-b">
                                 <p className="font-semibold">{edu.institution}</p>
                                 <p className="text-sm">{edu.degree}</p>
                                 <p className="text-xs text-muted-foreground">{edu.year}</p>
                             </div>
                         )) : <p className="text-muted-foreground">No education added yet.</p>}
                    </AccordionContent>
                </AccordionItem>
            </Card>

            <Card>
                 <AccordionItem value="projects">
                    <AccordionTrigger className="p-6 font-semibold text-lg flex items-center gap-2"><FolderKanban className="w-5 h-5 text-primary"/> Projects</AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p>{profile.projects || 'No projects added yet.'}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Card>

             <Card>
                 <AccordionItem value="achievements">
                    <AccordionTrigger className="p-6 font-semibold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary"/> Achievements</AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p>{profile.achievements || 'No achievements added yet.'}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Card>
        </Accordion>
    </div>
  );

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
        {authLoading || loading ? (
             <div className="container flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : isEditing ? (
            <ProfileForm />
        ) : (
            <ProfileView />
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
