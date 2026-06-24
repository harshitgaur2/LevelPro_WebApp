import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedCompany.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json({ data: saved });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { companyId } = await request.json();

    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedCompany.findUnique({
      where: {
        userId_drupalCompanyId: {
          userId: session.user.id,
          drupalCompanyId: companyId,
        },
      },
    });

    if (existing) {
      // Unsave (toggle)
      await prisma.savedCompany.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    }

    // Save
    await prisma.savedCompany.create({
      data: {
        userId: session.user.id,
        drupalCompanyId: companyId,
      },
    });

    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    console.error("Save company error:", error);
    return NextResponse.json(
      { error: "Failed to save company" },
      { status: 500 }
    );
  }
}
