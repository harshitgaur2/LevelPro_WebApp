import React from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer bg-surface-hover rounded-md", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 60%, rgba(255, 255, 255, 0))",
        backgroundSize: "200% 100%",
        backgroundColor: "var(--color-surface-hover)",
      }}
      {...props}
    />
  );
}
