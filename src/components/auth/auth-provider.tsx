'use client';

import {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
  ReactNode,
} from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Role = 'candidate' | 'employer' | 'tpo';
type Action = 'login' | 'signup';

interface AuthContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  action: Action;
  setAction: Dispatch<SetStateAction<Action>>;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>('candidate');
  const [action, setAction] = useState<Action>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider
      value={{ open, setOpen, role, setRole, action, setAction, user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
