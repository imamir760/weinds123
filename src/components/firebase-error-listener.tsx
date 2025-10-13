'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';

// This is a client component that listens for Firestore permission errors
// and throws them to be caught by the Next.js development error overlay.
// It should be placed at the root of your component tree, e.g., in a provider.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throw the error so Next.js can catch it and display the overlay
      // We wrap it in a timeout to escape the event handler's context
      setTimeout(() => {
        throw error;
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component doesn't render anything itself
  return null;
}
