import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 group', className)}>
      <svg
        width="100"
        height="30"
        viewBox="0 0 100 30"
        className="weinds-logo"
      >
        <text x="0" y="22" className="weinds-logo-text">
          Weinds
        </text>
      </svg>
    </Link>
  );
}
