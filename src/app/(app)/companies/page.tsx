"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/lib/api";
import { CompanyCard } from "@/components/company-card";
import { FilterBar } from "@/components/filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

function CompaniesList() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["companies", search, filters],
    queryFn: () => fetchCompanies({ ...filters, ...(search && { search }) }),
  });

  if (error) {
    throw error;
  }

  const companies = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text mb-2">Browse Companies</h1>
        <p className="text-text-secondary">
          Find top tech companies hiring for placement programs and internships.
        </p>
      </div>

      <div className="mb-8">
        <FilterBar
          onSearch={setSearch}
          onFilterChange={setFilters}
          placeholder="Search companies by name, industry..."
          filterOptions={[
            {
              key: "hiringStatus",
              label: "Hiring Status",
              options: [
                { label: "Actively Hiring", value: "actively_hiring" },
                { label: "Coming Soon", value: "coming_soon" },
                { label: "Closed", value: "closed" },
              ],
            },
            {
              key: "industry",
              label: "Industry",
              options: [
                { label: "Technology", value: "Technology" },
                { label: "Fintech", value: "Fintech" },
                { label: "E-commerce", value: "E-commerce" },
                { label: "Healthcare", value: "Healthcare" },
              ],
            },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <h3 className="text-lg font-medium text-text mb-1">No companies found</h3>
          <p className="text-text-secondary">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <ErrorBoundary>
      <CompaniesList />
    </ErrorBoundary>
  );
}
