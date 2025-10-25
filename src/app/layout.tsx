import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthModal } from '@/components/auth/auth-modal';
import { ConditionalHeader } from '@/components/conditional-header';
import { ConditionalFooter } from '@/components/conditional-footer';
import { FirebaseProvider } from '@/components/firebase-provider';

export const metadata: Metadata = {
  title: 'Weinds - Your AI-Powered Career OS',
  description:
    'Weinds is an AI-driven platform for candidates, employers, and TPOs. Featuring an AI career mentor, resume builder, job finder, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col'
        )}
      >
        <FirebaseProvider>
          <AuthProvider>
              <ConditionalHeader />
              <main className="flex-grow">{children}</main>
              <ConditionalFooter />
              <Toaster />
              <AuthModal />
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
