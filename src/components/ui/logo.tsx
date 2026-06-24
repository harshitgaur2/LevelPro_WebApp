import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="flex-shrink-0"
      >
        <circle cx="50" cy="50" r="50" fill="#00155a" className="dark:fill-primary-600" />
        {/* White arrow */}
        <path 
          d="M20 75 L70 25 M40 25 L70 25 L70 55" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Pink arrow */}
        <path 
          d="M35 85 L55 65 M45 65 L55 65 L55 75" 
          stroke="#ff1668" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      {!iconOnly && (
        <span className="font-heading font-bold text-3xl tracking-tight text-white leading-none">
          level<span className="text-[#ff1668]">Pro</span>
        </span>
      )}
    </div>
  );
}
