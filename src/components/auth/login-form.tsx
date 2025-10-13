'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { GoogleButton } from './google-button';
import Link from 'next/link';

export function LoginForm({ role }: { role: 'candidate' | 'employer' | 'tpo' }) {
  const { setAction } = useAuth();
  
  const emailPlaceholder = {
    candidate: 'name@example.com',
    employer: 'hr@company.com',
    tpo: 'tpo@example.edu',
  };

  return (
    <div className="grid gap-4 mt-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={emailPlaceholder[role]}
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="ml-auto inline-block text-xs underline">
                Forgot your password?
            </Link>
        </div>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
      <GoogleButton />
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Button variant="link" className="p-0 h-auto" onClick={() => setAction('signup')}>
          Sign up
        </Button>
      </div>
    </div>
  );
}
