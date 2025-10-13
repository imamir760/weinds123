'use client';

import {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

type Role = 'candidate' | 'employer' | 'tpo';
type Action = 'login' | 'signup';

interface AuthContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  action: Action;
  setAction: Dispatch<SetStateAction<Action>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>('candidate');
  const [action, setAction] = useState<Action>('login');

  return (
    <AuthContext.Provider
      value={{ open, setOpen, role, setRole, action, setAction }}
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
