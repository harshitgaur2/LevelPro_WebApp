"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInternships } from "@/lib/api";
import { InternshipCard } from "@/components/internship-card";
import { FilterBar } from "@/components/filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

function InternshipsList() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["internships", search, filters],
    queryFn: () => fetchInternships({ ...filters, ...(search && { search }) }),
  });

  if (error) {
    throw error;
  }

  const internships = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text mb-2">Internships</h1>
        <p className="text-text-secondary">
          Kickstart your career with hands-on experience at top companies.
        </p>
      </div>

      <div className="mb-8">
        <FilterBar
          onSearch={setSearch}
          onFilterChange={setFilters}
          placeholder="Search internships by title, skill, or company..."
          filterOptions={[
            {
              key: "isRemote",
              label: "Location Type",
              options: [
                { label: "Remote", value: "true" },
                { label: "On-site", value: "false" },
              ],
            },
            {
              key: "skill",
              label: "Required Skill",
              options: [
                { label: "React", value: "React" },
                { label: "Python", value: "Python" },
                { label: "Java", value: "Java" },
                { label: "Design", value: "Design" },
                { label: "Marketing", value: "Marketing" },
              ],
            },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : internships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <h3 className="text-lg font-medium text-text mb-1">No internships found</h3>
          <p className="text-text-secondary">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function InternshipsPage() {
  return (
    <ErrorBoundary>
      <InternshipsList />
    </ErrorBoundary>
  );
}
