'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Logo } from './logo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const NavLink = ({ href, label, className }: { href: string; label: string, className?: string; }) => (
    <Link
      href={href}
      className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-primary", className)}
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
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
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
                 <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close Menu</span>
                </Button>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                   <NavLink key={link.href} {...link} className="text-lg" />
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                   <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
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
