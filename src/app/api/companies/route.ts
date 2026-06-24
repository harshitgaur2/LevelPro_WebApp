import { NextResponse } from "next/server";
import { getCompanies, DrupalApiError } from "@/lib/drupal";
import type { Company, ApiListResponse, ApiErrorResponse } from "@/types/drupal";

export async function GET(
  request: Request
): Promise<NextResponse<ApiListResponse<Company> | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      industry: searchParams.get("industry") || undefined,
      location: searchParams.get("location") || undefined,
      hiringStatus: searchParams.get("hiringStatus") || undefined,
    };

    let companies = await getCompanies(filters);

    // Client-side search filter (Drupal JSON:API doesn't support full-text search natively)
    const search = searchParams.get("search");
    if (search) {
      const query = search.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      data: companies,
      meta: { total: companies.length },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch companies from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
