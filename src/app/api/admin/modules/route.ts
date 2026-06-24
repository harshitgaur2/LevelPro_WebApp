import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const moduleSchema = z.object({
  courseId: z.string().min(1),
  section: z.string().min(2).max(80),
  title: z.string().min(3).max(140),
  lectureCount: z.number().int().min(1).max(20),
  description: z.string().max(600).optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = moduleSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const lastModule = await prisma.courseModule.findFirst({
    where: { courseId: parsed.data.courseId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const courseModule = await prisma.courseModule.create({
    data: {
      courseId: parsed.data.courseId,
      section: parsed.data.section,
      title: parsed.data.title,
      lectureCount: parsed.data.lectureCount,
      description: parsed.data.description || null,
      orderIndex: (lastModule?.orderIndex || 0) + 1,
      isPublished: true,
    },
  });

  return NextResponse.json({ data: courseModule });
}
