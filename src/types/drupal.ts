import { z } from "zod/v4";

// =============================================================================
// Drupal JSON:API Response Types
// =============================================================================

export const drupalImageSchema = z.object({
  url: z.string().optional(),
  alt: z.string().optional(),
});

// Company
export const companySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  description: z.string(),
  industry: z.string(),
  website: z.string().nullable(),
  location: z.string(),
  hiringStatus: z.enum(["actively_hiring", "coming_soon", "closed"]),
});

export type Company = z.infer<typeof companySchema>;

// Placement Program
export const placementProgramSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  eligibility: z.string(),
  duration: z.string(),
  stipend: z.string().nullable(),
  deadline: z.string(),
  companyId: z.string().nullable(),
  companyName: z.string().nullable(),
});

export type PlacementProgram = z.infer<typeof placementProgramSchema>;

// Internship
export const internshipSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  skillsRequired: z.array(z.string()),
  duration: z.string(),
  stipend: z.string().nullable(),
  isRemote: z.boolean(),
  companyId: z.string().nullable(),
  companyName: z.string().nullable(),
});

export type Internship = z.infer<typeof internshipSchema>;

// FAQ
export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
});

export type FAQ = z.infer<typeof faqSchema>;

// =============================================================================
// API Response Wrappers
// =============================================================================

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
  };
}

export interface ApiDetailResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

// =============================================================================
// Filter Types
// =============================================================================

export interface CompanyFilters {
  industry?: string;
  location?: string;
  hiringStatus?: string;
  search?: string;
}

export interface ProgramFilters {
  eligibility?: string;
  deadline?: string;
  search?: string;
}

export interface InternshipFilters {
  isRemote?: boolean;
  skill?: string;
  search?: string;
}

export interface FaqFilters {
  category?: string;
}

// =============================================================================
// Drupal JSON:API Raw Types
// =============================================================================

export interface DrupalJsonApiResource {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships?: Record<
    string,
    {
      data: { type: string; id: string } | null;
    }
  >;
}

export interface DrupalJsonApiResponse {
  data: DrupalJsonApiResource | DrupalJsonApiResource[];
  included?: DrupalJsonApiResource[];
  meta?: Record<string, unknown>;
}
