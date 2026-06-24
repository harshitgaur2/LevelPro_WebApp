import { NextResponse } from "next/server";
import { getProgramById, DrupalApiError } from "@/lib/drupal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const program = await getProgramById(id);

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error("Error fetching program:", error);

    if (error instanceof DrupalApiError) {
      return NextResponse.json(
        { error: "Failed to fetch program from CMS" },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
