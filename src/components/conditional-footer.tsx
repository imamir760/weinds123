'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  const noFooterPaths = [
      '/employer/dashboard',
      '/employer/jobs',
      '/employer/all-candidates',
      '/employer/shortlisted',
      '/employer/final-interview',
      '/employer/campus',
      '/employer/skill-tests',
      '/employer/interviews',
      '/employer/profile',
      '/employer/settings',
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
  const shouldShowFooter = !noFooterPaths.some(path => pathname.startsWith(path));

  if (pathname === '/employer' || pathname === '/tpo' || pathname === '/candidate') {
      return null;
  }

  return shouldShowFooter ? <Footer /> : null;
}
