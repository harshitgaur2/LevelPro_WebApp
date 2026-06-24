import { NextResponse } from "next/server";
import { getFaqs, DrupalApiError } from "@/lib/drupal";
import type { FAQ, ApiListResponse, ApiErrorResponse } from "@/types/drupal";

export async function GET(
  request: Request
): Promise<NextResponse<ApiListResponse<FAQ> | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const faqs = await getFaqs(category);

    return NextResponse.json({
      data: faqs,
      meta: { total: faqs.length },
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch FAQs from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
