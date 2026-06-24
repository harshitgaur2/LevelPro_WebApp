import type {
  Company,
  PlacementProgram,
  Internship,
  FAQ,
  DrupalJsonApiResponse,
  DrupalJsonApiResource,
} from "@/types/drupal";

// =============================================================================
// Drupal Client — Fetches from JSON:API and transforms responses
// =============================================================================

const DRUPAL_BASE_URL = process.env.DRUPAL_BASE_URL || "http://localhost:8888";
const JSONAPI_BASE = `${DRUPAL_BASE_URL}/jsonapi`;

// Default revalidation: 60 seconds
const DEFAULT_REVALIDATE = 60;

/**
 * Fetch from Drupal JSON:API with caching
 */
async function drupalFetch<T>(
  endpoint: string,
  options?: {
    revalidate?: number;
    params?: Record<string, string>;
  }
): Promise<T> {
  const url = new URL(`${JSONAPI_BASE}${endpoint}`);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.api+json",
    },
    next: { revalidate: options?.revalidate ?? DEFAULT_REVALIDATE },
  });

  if (!response.ok) {
    throw new DrupalApiError(
      `Drupal API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export class DrupalApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "DrupalApiError";
  }
}

// =============================================================================
// Helper: Find included resource
// =============================================================================

function findIncluded(
  included: DrupalJsonApiResource[] | undefined,
  type: string,
  id: string
): DrupalJsonApiResource | undefined {
  return included?.find((r) => r.type === type && r.id === id);
}

function fieldValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const richValue = (value as { value?: unknown }).value;
    return typeof richValue === "string" ? richValue : null;
  }
  return null;
}

function fieldUrl(value: unknown, key: "url" | "uri"): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && key in value) {
    const urlValue = (value as Record<"url" | "uri", unknown>)[key];
    return typeof urlValue === "string" ? urlValue : null;
  }
  return null;
}

// =============================================================================
// Transformers — Convert Drupal JSON:API to clean typed objects
// =============================================================================

function transformCompany(resource: DrupalJsonApiResource): Company {
  const attrs = resource.attributes;
  return {
    id: resource.id,
    slug:
      (attrs.field_slug as string) ||
      (attrs.title as string || "").toLowerCase().replace(/\s+/g, "-"),
    name: (attrs.title as string) || (attrs.name as string) || "",
    logo: fieldUrl(attrs.field_logo, "url"),
    description:
      fieldValue(attrs.field_description) ||
      (attrs.field_description as string) ||
      "",
    industry: (attrs.field_industry as string) || "",
    website: fieldUrl(attrs.field_website, "uri"),
    location: (attrs.field_location as string) || "",
    hiringStatus: normalizeHiringStatus(
      (attrs.field_hiring_status as string) || "closed"
    ),
  };
}

function normalizeHiringStatus(
  status: string
): "actively_hiring" | "coming_soon" | "closed" {
  const normalized = status.toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "actively_hiring" || normalized === "active") return "actively_hiring";
  if (normalized === "coming_soon") return "coming_soon";
  return "closed";
}

function transformProgram(
  resource: DrupalJsonApiResource,
  included?: DrupalJsonApiResource[]
): PlacementProgram {
  const attrs = resource.attributes;
  const companyRel = resource.relationships?.field_company?.data;
  let companyName: string | null = null;

  if (companyRel && included) {
    const company = findIncluded(included, companyRel.type, companyRel.id);
    if (company) {
      companyName =
        (company.attributes.title as string) ||
        (company.attributes.name as string) ||
        null;
    }
  }

  return {
    id: resource.id,
    title: (attrs.title as string) || "",
    description:
      fieldValue(attrs.field_description) ||
      (attrs.field_description as string) ||
      "",
    eligibility: (attrs.field_eligibility as string) || "",
    duration: (attrs.field_duration as string) || "",
    stipend: (attrs.field_stipend as string) ?? null,
    deadline: (attrs.field_deadline as string) || "",
    companyId: companyRel?.id ?? null,
    companyName,
  };
}

function transformInternship(
  resource: DrupalJsonApiResource,
  included?: DrupalJsonApiResource[]
): Internship {
  const attrs = resource.attributes;
  const companyRel = resource.relationships?.field_company?.data;
  let companyName: string | null = null;

  if (companyRel && included) {
    const company = findIncluded(included, companyRel.type, companyRel.id);
    if (company) {
      companyName =
        (company.attributes.title as string) ||
        (company.attributes.name as string) ||
        null;
    }
  }

  const rawSkills = attrs.field_skills_required;
  const skills = Array.isArray(rawSkills)
    ? (rawSkills as string[])
    : typeof rawSkills === "string"
      ? rawSkills.split(",").map((s: string) => s.trim())
      : [];

  return {
    id: resource.id,
    title: (attrs.title as string) || "",
    description:
      fieldValue(attrs.field_description) ||
      (attrs.field_description as string) ||
      "",
    skillsRequired: skills,
    duration: (attrs.field_duration as string) || "",
    stipend: (attrs.field_stipend as string) ?? null,
    isRemote: Boolean(attrs.field_is_remote),
    companyId: companyRel?.id ?? null,
    companyName,
  };
}

function transformFaq(resource: DrupalJsonApiResource): FAQ {
  const attrs = resource.attributes;
  return {
    id: resource.id,
    question: (attrs.title as string) || (attrs.field_question as string) || "",
    answer:
      fieldValue(attrs.field_answer) ||
      (attrs.field_answer as string) ||
      "",
    category: (attrs.field_category as string) || "general",
  };
}

// =============================================================================
// Public API
// =============================================================================

export async function getCompanies(filters?: {
  industry?: string;
  location?: string;
  hiringStatus?: string;
}): Promise<Company[]> {
  const params: Record<string, string> = {};

  if (filters?.industry) {
    params["filter[field_industry]"] = filters.industry;
  }
  if (filters?.location) {
    params["filter[field_location]"] = filters.location;
  }
  if (filters?.hiringStatus) {
    params["filter[field_hiring_status]"] = filters.hiringStatus;
  }

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/company",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map((r) => transformCompany(r));
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

export async function getCompanyBySlug(
  slug: string
): Promise<Company | null> {
  const params: Record<string, string> = {
    "filter[field_slug]": slug,
  };

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/company",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];

    if (resources.length === 0) return null;
    return transformCompany(resources[0]);
  } catch (error) {
    console.error(`Failed to fetch company by slug ${slug}:`, error);
    return null;
  }
}

export async function getPrograms(filters?: {
  eligibility?: string;
  deadline?: string;
}): Promise<PlacementProgram[]> {
  const params: Record<string, string> = {
    include: "field_company",
  };

  if (filters?.eligibility) {
    params["filter[field_eligibility]"] = filters.eligibility;
  }

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/placement_program",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map((r) => transformProgram(r, response.included));
  } catch (error) {
    console.error("Failed to fetch placement programs:", error);
    return [];
  }
}

export async function getProgramById(
  id: string
): Promise<PlacementProgram | null> {
  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      `/node/placement_program/${id}`,
      { params: { include: "field_company" } }
    );

    const resource = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (!resource) return null;
    return transformProgram(resource, response.included);
  } catch {
    return null;
  }
}

export async function getInternships(filters?: {
  isRemote?: boolean;
  skill?: string;
}): Promise<Internship[]> {
  const params: Record<string, string> = {
    include: "field_company",
  };

  if (filters?.isRemote !== undefined) {
    params["filter[field_is_remote]"] = filters.isRemote ? "1" : "0";
  }

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/internship",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map((r) => transformInternship(r, response.included));
  } catch (error) {
    console.error("Failed to fetch internships:", error);
    return [];
  }
}

export async function getFaqs(category?: string): Promise<FAQ[]> {
  const params: Record<string, string> = {};

  if (category) {
    params["filter[field_category]"] = category;
  }

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/faq",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map(transformFaq);
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
}

export async function getProgramsByCompany(
  companyId: string
): Promise<PlacementProgram[]> {
  const params: Record<string, string> = {
    "filter[field_company.id]": companyId,
    include: "field_company",
  };

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/placement_program",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map((r) => transformProgram(r, response.included));
  } catch (error) {
    console.error(`Failed to fetch programs for company ${companyId}:`, error);
    return [];
  }
}

export async function getInternshipsByCompany(
  companyId: string
): Promise<Internship[]> {
  const params: Record<string, string> = {
    "filter[field_company.id]": companyId,
    include: "field_company",
  };

  try {
    const response = await drupalFetch<DrupalJsonApiResponse>(
      "/node/internship",
      { params }
    );

    const resources = Array.isArray(response.data)
      ? response.data
      : response.data ? [response.data] : [];
    return resources.map((r) => transformInternship(r, response.included));
  } catch (error) {
    console.error(`Failed to fetch internships for company ${companyId}:`, error);
    return [];
  }
}
