
'use client';

import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { saveUserProfile } from '@/lib/user-actions';

export function GoogleButton() {
  const router = useRouter();
  const { toast } = useToast();
  const { role, action, setOpen } = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const profileCollection = `${role}s` as 'candidates' | 'employers' | 'institutes';
      const userProfileRef = doc(db, profileCollection, user.uid);
      const userProfileDoc = await getDoc(userProfileRef);

      if (action === 'signup') {
        if (userProfileDoc.exists()) {
           await auth.signOut(); // Sign out the user to prevent login
           throw new Error(`An account already exists with this Google account for the '${role}' role. Please log in.`);
        }
        
        // Create the corresponding profile document
        let profileData: any = {};
        if (role === 'candidate') {
            profileData = {
              fullName: user.displayName || '',
              email: user.email,
            };
        } else if (role === 'employer') {
            profileData = {
              companyName: user.displayName || '',
              email: user.email,
            };
        } else if (role === 'tpo') {
            profileData = {
              institutionName: user.displayName || '',
              tpoEmail: user.email,
            };
        }
        saveUserProfile(profileCollection, user.uid, profileData);

      } else { // login
        if (!userProfileDoc.exists()) {
           await auth.signOut(); // Sign out the user as they don't have the correct role profile
           throw new Error(`No '${role}' account found for this user. Please sign up first.`);
        }
      }

      setOpen(false);
      toast({
        title: `${action === 'signup' ? 'Sign up' : 'Login'} Successful`,
        description: `Welcome, ${user.displayName}!`,
      });

      const redirectPath = role === 'tpo' && action === 'signup' 
        ? '/tpo/profile-setup' 
        : `/${role}/dashboard`;
      router.push(redirectPath);

    } catch (error: any) {
      // Ensure user is signed out on any error during the process
      if (auth.currentUser) {
        await auth.signOut();
      }
      console.error("Google sign-in error:", error);
      toast({
        title: `Google ${action} failed`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button">
        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5 mr-2"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Google
        </div>
      </Button>
    </>
  );
}
