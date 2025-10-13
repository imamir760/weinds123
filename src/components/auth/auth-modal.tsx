'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './auth-provider';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';

export function AuthModal() {
  const { open, setOpen, role, action, setAction } = useAuth();

  const roleName =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-8">
        <DialogHeader className="items-center text-center">
          <Logo />
          <DialogTitle
            className={cn('text-2xl font-bold pt-4', role === 'tpo' && 'hidden')}
          >
            {roleName} {action === 'login' ? 'Login' : 'Sign Up'}
          </DialogTitle>
           <DialogTitle
            className={cn('text-2xl font-bold pt-4', role !== 'tpo' && 'hidden')}
          >
            Institutional {action === 'login' ? 'Login' : 'Sign Up'}
          </DialogTitle>
          <DialogDescription>
            {action === 'login'
              ? 'Welcome back! Access your dashboard.'
              : `Create an account to get started.`}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={action}
          onValueChange={value => setAction(value as 'login' | 'signup')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm role={role} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm role={role} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
