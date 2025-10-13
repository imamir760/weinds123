'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  const noHeaderPaths = [
      '/candidate/dashboard',
      '/employer/dashboard',
      '/tpo/dashboard'
  ];

  const shouldShowHeader = !noHeaderPaths.some(path => pathname.startsWith(path));

  return shouldShowHeader ? <Header /> : null;
}
