'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { GoogleButton } from './google-button';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm({ role }: { role: 'candidate' | 'employer' | 'tpo' }) {
  const { setAction, setOpen } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const emailPlaceholder = {
    candidate: 'name@example.com',
    employer: 'hr@company.com',
    tpo: 'tpo@example.edu',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === role) {
          setOpen(false); // Close modal
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          router.push(`/${role}/dashboard`);
        } else {
          throw new Error(`You are not registered as a ${role}.`);
        }
      } else {
        throw new Error("User data not found.");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid gap-4 mt-4" onSubmit={handleLogin}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={emailPlaceholder[role]}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" onClick={() => setOpen(false)} className="ml-auto inline-block text-xs underline">
                Forgot your password?
            </Link>
        </div>
        <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
      <GoogleButton />
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Button variant="link" className="p-0 h-auto" onClick={() => setAction('signup')} type="button">
          Sign up
        </Button>
      </div>
    </form>
  );
}
