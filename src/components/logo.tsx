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
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
            .weinds-logo-text {
              font-family: 'Pacifico', cursive;
              font-size: 24px;
              fill: hsl(var(--primary));
              stroke: hsl(var(--primary));
              stroke-width: 0.5;
              stroke-dasharray: 250;
              stroke-dashoffset: 250;
              animation: writeAndVanish 5s ease-in-out infinite;
            }
            @keyframes writeAndVanish {
              0% {
                stroke-dashoffset: 250;
                fill-opacity: 0;
              }
              40% {
                stroke-dashoffset: 0;
                fill-opacity: 1;
              }
              80% {
                fill-opacity: 1;
              }
              100% {
                stroke-dashoffset: 0;
                fill-opacity: 0;
              }
            }
          `}
        </style>
        <text x="0" y="22" className="weinds-logo-text">
          Weinds
        </text>
      </svg>
    </Link>
  );
}
