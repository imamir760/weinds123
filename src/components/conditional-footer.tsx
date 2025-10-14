'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  const noFooterPaths = [
      '/candidate/dashboard',
      '/candidate/profile',
      '/candidate/applications',
      '/candidate/jobs',
      '/candidate/internships',
      '/candidate/companies',
      '/candidate/ai-interviews',
      '/candidate/resume-builder',
      '/candidate/disha',
      '/candidate/settings',
      '/tpo/dashboard',
      '/tpo/placements',
      '/tpo/companies',
      '/tpo/students',
      '/tpo/settings',
      '/tpo/profile-setup',
      '/tpo/internships',
  ];

  // Hide footer if the current path starts with any of the paths in noFooterPaths
  // or if it's an employer path
  const shouldShowFooter = !noFooterPaths.some(path => pathname.startsWith(path)) && !pathname.startsWith('/employer');

  if (pathname === '/employer' || pathname === '/tpo' || pathname === '/candidate') {
      return null;
  }

  return shouldShowFooter ? <Footer /> : null;
}
