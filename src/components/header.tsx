'use client';

import { Menu, X, Users, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Logo } from './logo';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const NavLink = ({
    href,
    label,
    className,
  }: {
    href: string;
    label: string;
    className?: string;
  }) => (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
        className
      )}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-10">
          {navLinks.map(link => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">Log In</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/candidate/login" className="flex items-center gap-2">
                    <Users /> For Candidates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/employer/login" className="flex items-center gap-2">
                    <Briefcase /> For Employers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tpo/login" className="flex items-center gap-2">
                    <GraduationCap /> For Institutions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Sign Up</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                  <Link href="/candidate/signup" className="flex items-center gap-2">
                    <Users /> For Candidates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/employer/signup" className="flex items-center gap-2">
                    <Briefcase /> For Employers
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tpo/signup" className="flex items-center gap-2">
                    <GraduationCap /> For Institutions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader className="flex-row justify-between items-center p-4 -ml-4 -mt-4 mr-4">
                <Logo />
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close Menu</span>
                </Button>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map(link => (
                  <NavLink key={link.href} {...link} className="text-lg" />
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <h3 className="px-4 text-sm font-semibold text-muted-foreground">Login</h3>
                   <Button variant="ghost" asChild className="justify-start">
                      <Link href="/candidate/login" onClick={() => setMenuOpen(false)}>For Candidates</Link>
                    </Button>
                     <Button variant="ghost" asChild className="justify-start">
                      <Link href="/employer/login" onClick={() => setMenuOpen(false)}>For Employers</Link>
                    </Button>
                     <Button variant="ghost" asChild className="justify-start">
                      <Link href="/tpo/login" onClick={() => setMenuOpen(false)}>For Institutions</Link>
                    </Button>

                   <h3 className="px-4 text-sm font-semibold text-muted-foreground pt-4">Sign Up</h3>
                     <Button variant="ghost" asChild className="justify-start">
                      <Link href="/candidate/signup" onClick={() => setMenuOpen(false)}>For Candidates</Link>
                    </Button>
                     <Button variant="ghost" asChild className="justify-start">
                      <Link href="/employer/signup" onClick={() => setMenuOpen(false)}>For Employers</Link>
                    </Button>
                     <Button variant="ghost" asChild className="justify-start">
                      <Link href="/tpo/signup" onClick={() => setMenuOpen(false)}>For Institutions</Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
