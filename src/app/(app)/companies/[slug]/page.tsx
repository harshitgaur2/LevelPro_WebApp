"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCompany, fetchSavedCompanies, toggleSaveCompany } from "@/lib/api";
import { MapPin, Briefcase, Globe, Bookmark, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramCard } from "@/components/program-card";
import { InternshipCard } from "@/components/internship-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { useSession } from "next-auth/react";

function CompanyDetail() {
  const params = useParams();
  const slug = params?.slug as string;
  const { status } = useSession();
  const queryClient = useQueryClient();

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => fetchCompany(slug),
    enabled: !!slug,
  });

  const { data: savedData } = useQuery({
    queryKey: ["saved-companies"],
    queryFn: fetchSavedCompanies,
    enabled: status === "authenticated",
  });

  const company = companyData?.data;
  const isSaved = savedData?.data?.some(
    (s) => s.drupalCompanyId === company?.id
  );

  const toggleSaveMutation = useMutation({
    mutationFn: (id: string) => toggleSaveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-companies"] });
    },
  });

  if (error) {
    throw error;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold font-heading text-text mb-4">Company not found</h2>
        <Link href="/companies">
          <Button variant="secondary">Back to Companies</Button>
        </Link>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/companies" className="inline-flex items-center gap-2 mb-6 group">
        <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-primary-500 transition-colors" />
        <span className="text-sm font-medium text-text-muted group-hover:text-text transition-colors">
          Back to Companies
        </span>
      </Link>

      {/* Header Card */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary-500/20 to-accent-500/20" />
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
            <Avatar 
              src={company.logo} 
              name={company.name} 
              size="xl" 
              className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-surface bg-white shadow-md" 
            />
            <div className="flex gap-3">
              {status === "authenticated" && (
                <Button
                  variant={isSaved ? "secondary" : "outline"}
                  onClick={() => toggleSaveMutation.mutate(company.id)}
                  isLoading={toggleSaveMutation.isPending}
                  leftIcon={<Bookmark className={isSaved ? "fill-current" : ""} w-4 h-4 />}
                >
                  {isSaved ? "Saved" : "Save Company"}
                </Button>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" leftIcon={<Globe className="w-4 h-4" />}>
                    Visit Website
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-text">
                {company.name}
              </h1>
              <Badge variant={badgeProps.variant}>{badgeProps.text}</Badge>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{company.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <section className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold font-heading text-text mb-4">About {company.name}</h2>
            <div 
              className="prose dark:prose-invert max-w-none text-text-secondary"
              dangerouslySetInnerHTML={{ __html: company.description }}
            />
          </section>

          {/* Placement Programs */}
          {company.programs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-heading text-text mb-4">Placement Programs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.programs.map(program => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </section>
          )}

          {/* Internships */}
          {company.internships.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-heading text-text mb-4">Internships</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.internships.map(internship => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            </section>
          )}

          {company.programs.length === 0 && company.internships.length === 0 && (
            <div className="bg-surface-elevated rounded-2xl border border-border border-dashed p-10 text-center">
              <p className="text-text-secondary mb-2">No active openings at the moment.</p>
              <p className="text-sm text-text-muted">Check back later or save the company to be notified.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Facts Sidebar */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-text mb-4 pb-2 border-b border-border-light">Quick Facts</h3>
            <ul className="space-y-4">
              <li>
                <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Industry</span>
                <span className="text-sm text-text">{company.industry}</span>
              </li>
              <li>
                <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Headquarters</span>
                <span className="text-sm text-text">{company.location}</span>
              </li>
              {company.website && (
                <li>
                  <span className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Website</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all">
                    {company.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  return (
    <ErrorBoundary>
      <CompanyDetail />
    </ErrorBoundary>
  );
}
