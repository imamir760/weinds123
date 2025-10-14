'use client';

import { ReactNode } from 'react';
import { FirebaseErrorListener } from './firebase-error-listener';

export function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <FirebaseErrorListener />
      {children}
    </>
  );
}
