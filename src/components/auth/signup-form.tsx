'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { GoogleButton } from './google-button';

export function SignupForm({
  role,
}: {
  role: 'candidate' | 'employer' | 'tpo';
}) {
  const { setAction } = useAuth();

  const emailPlaceholder = {
    candidate: 'name@example.com',
    employer: 'hr@company.com',
    tpo: 'tpo@example.edu',
  };

  return (
    <div className="grid gap-4 mt-4">
      {role === 'candidate' && (
        <div className="grid gap-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input id="full-name" placeholder="John Doe" required />
        </div>
      )}
      {role === 'employer' && (
        <div className="grid gap-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input id="company-name" placeholder="TechCorp Inc." required />
        </div>
      )}
      {role === 'tpo' && (
        <div className="grid gap-2">
          <Label htmlFor="institution-name">Institution Name</Label>
          <Input
            id="institution-name"
            placeholder="Elite University"
            required
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder={emailPlaceholder[role]}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password-signup" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Create an account
      </Button>
      <GoogleButton />
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => setAction('login')}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
