"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPrograms } from "@/lib/api";
import { ProgramCard } from "@/components/program-card";
import { FilterBar } from "@/components/filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

function ProgramsList() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["programs", search, filters],
    queryFn: () => fetchPrograms({ ...filters, ...(search && { search }) }),
  });

  if (error) {
    throw error;
  }

  const programs = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text mb-2">Placement Programs</h1>
        <p className="text-text-secondary">
          Discover specialized hiring programs, graduate roles, and fast-track career opportunities.
        </p>
      </div>

      <div className="mb-8">
        <FilterBar
          onSearch={setSearch}
          onFilterChange={setFilters}
          placeholder="Search programs by title, company..."
          filterOptions={[
            {
              key: "eligibility",
              label: "Eligibility Year",
              options: [
                { label: "2024", value: "2024" },
                { label: "2025", value: "2025" },
                { label: "2026", value: "2026" },
              ],
            },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <h3 className="text-lg font-medium text-text mb-1">No programs found</h3>
          <p className="text-text-secondary">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <ErrorBoundary>
      <ProgramsList />
    </ErrorBoundary>
  );
}
