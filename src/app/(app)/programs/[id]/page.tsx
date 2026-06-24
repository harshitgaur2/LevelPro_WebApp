"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchProgram, submitApplication } from "@/lib/api";
import { Clock, CalendarDays, Banknote, Building2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatDeadline } from "@/lib/utils";
import { useSession } from "next-auth/react";

function ProgramDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { status } = useSession();
  const [hasApplied, setHasApplied] = useState(false);

  const { data: programData, isLoading, error } = useQuery({
    queryKey: ["program", id],
    queryFn: () => fetchProgram(id),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => submitApplication({ programId: id }),
    onSuccess: () => {
      setHasApplied(true);
    },
  });

  const program = programData?.data;

  if (error) {
    throw error;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold font-heading text-text mb-4">Program not found</h2>
        <Link href="/programs">
          <Button variant="secondary">Back to Programs</Button>
        </Link>
      </div>
    );
  }

  const handleApply = () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/programs/${id}`);
      return;
    }
    applyMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/programs" className="inline-flex items-center gap-2 mb-6 group">
        <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-primary-500 transition-colors" />
        <span className="text-sm font-medium text-text-muted group-hover:text-text transition-colors">
          Back to Programs
        </span>
      </Link>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="p-6 sm:p-10 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              {program.companyName && (
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium mb-3">
                  <Building2 className="w-5 h-5" />
                  <span>{program.companyName}</span>
                </div>
              )}
              <h1 className="text-3xl font-bold font-heading text-text mb-4">
                {program.title}
              </h1>
              
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-500" />
                  <span>
                    <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">Duration</span>
                    {program.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-500" />
                  <span>
                    <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">Deadline</span>
                    {formatDeadline(program.deadline)}
                  </span>
                </div>
                {program.stipend && (
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-green-500" />
                    <span>
                      <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5">Stipend/Salary</span>
                      {program.stipend}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:shrink-0 w-full md:w-auto">
              <Button 
                size="lg" 
                className="w-full md:w-auto text-base px-8" 
                leftIcon={!hasApplied && <Send className="w-5 h-5" />}
                onClick={handleApply}
                disabled={hasApplied || applyMutation.isPending}
                isLoading={applyMutation.isPending}
                variant={hasApplied ? "secondary" : "primary"}
              >
                {hasApplied ? "Applied Successfully" : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-surface-elevated/30">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-2">Eligibility</h2>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-text-secondary">{program.eligibility}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Program Details</h2>
            <div 
              className="prose dark:prose-invert max-w-none text-text-secondary"
              dangerouslySetInnerHTML={{ __html: program.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgramDetailPage() {
  return (
    <ErrorBoundary>
      <ProgramDetail />
    </ErrorBoundary>
  );
}
