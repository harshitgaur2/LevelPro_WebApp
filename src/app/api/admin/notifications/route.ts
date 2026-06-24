import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const notificationSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(10).max(1200),
  audience: z.enum(["all", "course", "batch", "student"]),
  type: z.enum([
    "CLASS_UPDATE",
    "ASSIGNMENT",
    "CLASS_REMINDER",
    "PDF_RESOURCE",
    "RESOURCE",
    "LIVE_CLASS",
    "PLACEMENT_UPDATE",
    "INTERVIEW_UPDATE",
    "ANNOUNCEMENT",
  ]).default("ANNOUNCEMENT"),
  courseId: z.string().optional(),
  batchId: z.string().optional(),
  targetUserId: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  classLink: z.string().url().optional().or(z.literal("")),
  resourceUrl: z.string().url().optional().or(z.literal("")),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = notificationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  if (parsed.data.audience === "course" && !parsed.data.courseId) {
    return NextResponse.json({ error: "Course is required for course notifications" }, { status: 400 });
  }

  if (parsed.data.audience === "batch" && !parsed.data.batchId) {
    return NextResponse.json({ error: "Batch is required for batch notifications" }, { status: 400 });
  }

  if (parsed.data.audience === "student" && !parsed.data.targetUserId) {
    return NextResponse.json({ error: "Student is required for student notifications" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      title: parsed.data.title,
      message: parsed.data.message,
      audience: parsed.data.audience,
      type: parsed.data.type,
      courseId: parsed.data.audience === "course" ? parsed.data.courseId : null,
      batchId: parsed.data.audience === "batch" ? parsed.data.batchId : null,
      targetUserId: parsed.data.audience === "student" ? parsed.data.targetUserId : null,
      pdfUrl: parsed.data.pdfUrl || null,
      classLink: parsed.data.classLink || null,
      resourceUrl: parsed.data.resourceUrl || null,
      createdById: session.user.id,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return NextResponse.json({ data: notification });
}
