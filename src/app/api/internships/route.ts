import { NextResponse } from "next/server";
import { getInternships, DrupalApiError } from "@/lib/drupal";
import type { Internship, ApiListResponse, ApiErrorResponse } from "@/types/drupal";

export async function GET(
  request: Request
): Promise<NextResponse<ApiListResponse<Internship> | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const isRemoteParam = searchParams.get("isRemote");
    const filters = {
      isRemote: isRemoteParam !== null ? isRemoteParam === "true" : undefined,
      skill: searchParams.get("skill") || undefined,
    };

    let internships = await getInternships(filters);

    // Client-side search
    const search = searchParams.get("search");
    if (search) {
      const query = search.toLowerCase();
      internships = internships.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.skillsRequired.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Client-side skill filter (if Drupal filter didn't handle it)
    if (filters.skill) {
      const skill = filters.skill.toLowerCase();
      internships = internships.filter((i) =>
        i.skillsRequired.some((s) => s.toLowerCase().includes(skill))
      );
    }

    return NextResponse.json({
      data: internships,
      meta: { total: internships.length },
    });
  } catch (error) {
    console.error("Error fetching internships:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch internships from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
