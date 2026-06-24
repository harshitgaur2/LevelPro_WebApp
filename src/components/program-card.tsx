import React from "react";
import Link from "next/link";
import { Clock, CalendarDays, Banknote, Building2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { formatDeadline } from "@/lib/utils";
import type { PlacementProgram } from "@/types/drupal";

interface ProgramCardProps {
  program: PlacementProgram;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link href={`/programs/${program.id}`} className="block h-full">
      <Card variant="interactive" className="h-full flex flex-col group">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3 gap-4">
            <h3 className="text-lg font-bold font-heading text-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {program.title}
            </h3>
            <Badge variant="primary" className="shrink-0 whitespace-nowrap">
              Program
            </Badge>
          </div>
          
          {program.companyName && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-4">
              <Building2 className="w-4 h-4 text-text-muted" />
              <span>{program.companyName}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-muted mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0 text-accent-500" />
              <span className="truncate" title={program.duration}>{program.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 shrink-0 text-primary-500" />
              <span className="truncate" title={`Deadline: ${formatDeadline(program.deadline)}`}>
                {formatDeadline(program.deadline)}
              </span>
            </div>
            {program.stipend && (
              <div className="flex items-center gap-1.5 col-span-2">
                <Banknote className="w-4 h-4 shrink-0 text-green-500" />
                <span className="truncate" title={program.stipend}>{program.stipend}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-text-secondary line-clamp-2 mt-auto pt-4 border-t border-border-light">
            <span className="font-medium text-text block mb-1">Eligibility:</span>
            {program.eligibility}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
