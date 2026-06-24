"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  filterOptions?: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function FilterBar({
  onSearch,
  onFilterChange,
  filterOptions = [],
  placeholder = "Search...",
  className,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchValue("");
    onSearch("");
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className={cn("bg-surface-elevated rounded-2xl border border-border p-4 shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-surface"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("");
                onSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filterOptions.length > 0 && (
          <Button
            variant={showFilters || activeFilterCount > 0 ? "primary" : "secondary"}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            className="sm:w-auto w-full"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {showFilters && filterOptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-light animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.key}>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">
                  {filter.label}
                </label>
                <Select
                  options={[{ label: "All", value: "" }, ...filter.options]}
                  value={filters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="bg-surface text-sm py-2"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0 && !searchValue}>
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
