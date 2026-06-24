import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "error" | "outline";
}

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-surface-elevated text-text-secondary border border-border",
    primary: "bg-primary-100 text-primary-800 border border-primary-200 dark:bg-primary-900/50 dark:text-primary-300 dark:border-primary-800",
    accent: "bg-accent-100 text-accent-800 border border-accent-200 dark:bg-accent-900/50 dark:text-accent-300 dark:border-accent-800",
    success: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    error: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
    outline: "border border-border text-text-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
