'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  const noHeaderPaths = [
      '/candidate/dashboard',
      '/candidate/profile',
      '/candidate/applications',
      '/candidate/jobs',
      '/candidate/internships',
      '/candidate/settings',
      '/tpo/dashboard',
      '/tpo/placements',
      '/tpo/companies',
      '/tpo/students',
      '/tpo/settings',
      '/tpo/profile-setup',
      '/tpo/internships',

  ];

  // Hide header if the current path starts with any of the paths in noHeaderPaths
  // or if it's an employer path
  const shouldShowHeader = !noHeaderPaths.some(path => pathname.startsWith(path)) && !pathname.startsWith('/employer');


  if (pathname === '/employer' || pathname === '/tpo' || pathname === '/candidate') {
      return null;
  }

  return shouldShowHeader ? <Header /> : null;
}
