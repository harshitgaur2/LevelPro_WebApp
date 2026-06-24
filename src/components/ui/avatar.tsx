import React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const displayName = name || alt || "User";
  const initials = getInitials(displayName);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={displayName}
          className="aspect-square h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials on error
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const span = document.createElement("span");
              span.className = "flex h-full w-full items-center justify-center font-medium";
              span.innerText = initials;
              parent.appendChild(span);
            }
          }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium">
          {initials}
        </span>
      )}
    </div>
  );
}
