'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  LogOut,
  User,
  Menu,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PostJobDialog } from '@/components/employer/post-job-dialog';
import { CreatePipelineDialog } from '@/components/employer/create-pipeline-dialog';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type EmployerLayoutContextType = {
  setIsPostJobOpen: (isOpen: boolean) => void;
};

const EmployerLayoutContext = createContext<EmployerLayoutContextType | undefined>(
  undefined
);

export const useEmployerLayout = () => {
  const context = useContext(EmployerLayoutContext);
  if (!context) {
    throw new Error(
      'useEmployerLayout must be used within a EmployerLayout provider'
    );
  }
  return context;
};

const navigation = [
  { name: 'Dashboard', href: '/employer/dashboard', icon: Briefcase },
  { name: 'My Postings', href: '/employer/jobs', icon: Briefcase },
  { name: 'All Applicants', href: '/employer/all-candidates', icon: Users },
  { name: 'Company Profile', href: '/employer/profile', icon: User },
];

function SidebarNav() {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        <Logo />
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-50`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [jobDetailsForPipeline, setJobDetailsForPipeline] = useState<any>(null);
  const [postTypeForPipeline, setPostTypeForPipeline] = useState<
    'job' | 'internship'
  >('job');

  const handlePipelineOpen = (details: any, postType: 'job' | 'internship') => {
    setJobDetailsForPipeline(details);
    setPostTypeForPipeline(postType);
    setIsPostJobOpen(false);
    setIsCreatePipelineOpen(true);
  };

  return (
    <EmployerLayoutContext.Provider value={{ setIsPostJobOpen }}>
      <div className="min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40 overflow-x-hidden">
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-10 w-[280px] border-r bg-background dark:bg-gray-950">
          <SidebarNav />
        </aside>
        <div className="lg:pl-[280px]">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden h-10 w-10 shrink-0"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SidebarNav />
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1 lg:hidden">
              <Logo />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
            </div>
          </header>
          {children}
        </div>
      </div>
      <PostJobDialog
        open={isPostJobOpen}
        onOpenChange={setIsPostJobOpen}
        onPipelineOpen={handlePipelineOpen}
      />
      <CreatePipelineDialog
        open={isCreatePipelineOpen}
        onOpenChange={setIsCreatePipelineOpen}
        jobDetails={jobDetailsForPipeline}
        postType={postTypeForPipeline}
      />
    </EmployerLayoutContext.Provider>
  );
}
