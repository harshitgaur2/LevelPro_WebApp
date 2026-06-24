import React from "react";
import Link from "next/link";
import { Clock, Laptop, Building2, Banknote } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Internship } from "@/types/drupal";

interface InternshipCardProps {
  internship: Internship;
}

export function InternshipCard({ internship }: InternshipCardProps) {
  return (
    <Link href="/internships" className="block h-full">
      <Card variant="interactive" className="h-full flex flex-col group">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3 gap-4">
            <h3 className="text-lg font-bold font-heading text-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {internship.title}
            </h3>
            {internship.isRemote && (
              <Badge variant="accent" className="shrink-0 whitespace-nowrap">
                Remote
              </Badge>
            )}
          </div>
          
          {internship.companyName && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-4">
              <Building2 className="w-4 h-4 text-text-muted" />
              <span>{internship.companyName}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-muted mb-5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0 text-primary-500" />
              <span className="truncate" title={internship.duration}>{internship.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4 shrink-0 text-accent-500" />
              <span className="truncate">{internship.isRemote ? "Work from Home" : "On-site"}</span>
            </div>
            {internship.stipend && (
              <div className="flex items-center gap-1.5 col-span-2">
                <Banknote className="w-4 h-4 shrink-0 text-green-500" />
                <span className="truncate" title={internship.stipend}>{internship.stipend}</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4 border-t border-border-light">
            <div className="flex flex-wrap gap-1.5">
              {internship.skillsRequired.slice(0, 3).map((skill, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-hover text-text-secondary"
                >
                  {skill}
                </span>
              ))}
              {internship.skillsRequired.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-hover text-text-muted">
                  +{internship.skillsRequired.length - 3} more
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
