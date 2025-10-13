'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TpoSignupPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline">Register your Institution</CardTitle>
          <CardDescription>
            Join the Weinds network to connect your students with opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="institution-name">Institution Name</Label>
              <Input id="institution-name" placeholder="Elite University" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tpo-email">TPO Email</Label>
              <Input
                id="tpo-email"
                type="email"
                placeholder="tpo@elite.edu"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full mt-2">
              Register
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already registered?{' '}
            <Link href="/tpo/login" className="underline text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
