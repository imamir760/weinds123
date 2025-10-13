'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  const noHeaderPaths = [
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
      '/tpo/dashboard',
      '/tpo/placements',
      '/tpo/companies',
      '/tpo/students',
      '/tpo/settings',
      '/tpo/profile-setup',
      '/tpo/internships',

  ];

  // Hide header if the current path starts with any of the paths in noHeaderPaths
  const shouldShowHeader = !noHeaderPaths.some(path => pathname.startsWith(path));

  if (pathname === '/employer' || pathname === '/tpo') {
      return null;
  }

  return shouldShowHeader ? <Header /> : null;
}
