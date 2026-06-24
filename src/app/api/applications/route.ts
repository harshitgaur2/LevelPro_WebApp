import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({ data: applications });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { programId, internshipId } = await request.json();

    if (!programId && !internshipId) {
      return NextResponse.json(
        { error: "programId or internshipId is required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        drupalProgramId: programId || null,
        drupalInternshipId: internshipId || null,
      },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
