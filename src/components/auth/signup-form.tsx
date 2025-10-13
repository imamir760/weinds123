'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { GoogleButton } from './google-button';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { saveUserProfile } from '@/lib/user-actions';

export function SignupForm({
  role,
}: {
  role: 'candidate' | 'employer' | 'tpo';
}) {
  const { setAction, setOpen } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const emailPlaceholder = {
    candidate: 'name@example.com',
    employer: 'hr@company.com',
    tpo: 'tpo@example.edu',
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create the main user document in /users
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        displayName: name,
        createdAt: new Date(),
      });
      
      // Create the corresponding profile document in the role-specific collection
      if (role === 'candidate') {
          saveUserProfile('candidates', user.uid, {
            fullName: name,
            headline: '',
            skills: '',
            experience: '',
            education: ''
          });
      } else if (role === 'employer') {
          saveUserProfile('employers', user.uid, {
            companyName: name,
            website: '',
            tagline: '',
            description: '',
            industry: '',
            companySize: ''
          });
      } else if (role === 'tpo') {
          saveUserProfile('institutes', user.uid, {
            institutionName: name,
            website: '',
            description: '',
            tpoName: '',
            tpoEmail: user.email || ''
          });
      }

      setOpen(false); // Close modal on success
      toast({
        title: "Account Created!",
        description: "You have been successfully signed up.",
      });

      // Redirect to the appropriate dashboard or profile setup
      const redirectPath = role === 'tpo' ? '/tpo/profile-setup' : `/${role}/dashboard`;
      router.push(redirectPath);

    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="grid gap-4 mt-4" onSubmit={handleSignup}>
      {role === 'candidate' && (
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)}/>
        </div>
      )}
      {role === 'employer' && (
        <div className="grid gap-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input id="company-name" placeholder="TechCorp Inc." required value={name} onChange={e => setName(e.target.value)}/>
        </div>
      )}
      {role === 'tpo' && (
        <div className="grid gap-2">
          <Label htmlFor="institution-name">Institution Name</Label>
          <Input
            id="institution-name"
            placeholder="Elite University"
            required
            value={name} onChange={e => setName(e.target.value)}
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder={emailPlaceholder[role]}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input id="password-signup" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create an account
      </Button>
      <GoogleButton />
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => setAction('login')}
          type="button"
        >
          Login
        </Button>
      </div>
    </form>
  );
}
