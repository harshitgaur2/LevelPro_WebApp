import { NextResponse } from "next/server";
import { getPrograms, DrupalApiError } from "@/lib/drupal";
import type { PlacementProgram, ApiListResponse, ApiErrorResponse } from "@/types/drupal";

export async function GET(
  request: Request
): Promise<NextResponse<ApiListResponse<PlacementProgram> | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      eligibility: searchParams.get("eligibility") || undefined,
      deadline: searchParams.get("deadline") || undefined,
    };

    let programs = await getPrograms(filters);

    // Client-side search
    const search = searchParams.get("search");
    if (search) {
      const query = search.toLowerCase();
      programs = programs.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      data: programs,
      meta: { total: programs.length },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch programs from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
