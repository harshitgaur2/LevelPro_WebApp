import React from "react";
import Link from "next/link";
import { MapPin, Briefcase, Globe } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import type { Company } from "@/types/drupal";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const getHiringBadgeProps = (status: string) => {
    switch (status) {
      case "actively_hiring":
        return { variant: "success" as const, text: "Actively Hiring" };
      case "coming_soon":
        return { variant: "warning" as const, text: "Coming Soon" };
      default:
        return { variant: "outline" as const, text: "Closed" };
    }
  };

  const badgeProps = getHiringBadgeProps(company.hiringStatus);

  return (
    <Link href={`/companies/${company.slug}`} className="block h-full">
      <Card variant="interactive" className="h-full flex flex-col group">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <Avatar 
              src={company.logo} 
              name={company.name} 
              size="lg" 
              className="bg-white p-1 border border-border shadow-sm group-hover:shadow-md transition-shadow" 
            />
            <Badge variant={badgeProps.variant}>{badgeProps.text}</Badge>
          </div>
          
          <h3 className="text-xl font-bold font-heading text-text mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {company.name}
          </h3>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted mb-4">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{company.industry}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{company.location}</span>
            </div>
          </div>
          
          <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-grow">
            {company.description.replace(/<[^>]*>?/gm, '')}
          </p>

          {company.website && (
            <div className="mt-auto pt-4 border-t border-border-light flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
