'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  const noHeaderPaths = [
      '/employer'
  ];

  // Hide header if the current path starts with any of the paths in noHeaderPaths
  const shouldShowHeader = !noHeaderPaths.some(path => pathname.startsWith(path));

  return shouldShowHeader ? <Header /> : null;
}
