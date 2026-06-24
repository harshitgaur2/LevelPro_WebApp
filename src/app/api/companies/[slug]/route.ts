import { NextResponse } from "next/server";
import {
  getCompanyBySlug,
  getProgramsByCompany,
  getInternshipsByCompany,
  DrupalApiError,
} from "@/lib/drupal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Fetch related programs and internships
    const [programs, internships] = await Promise.all([
      getProgramsByCompany(company.id),
      getInternshipsByCompany(company.id),
    ]);

    return NextResponse.json({
      data: {
        ...company,
        programs,
        internships,
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch company from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
