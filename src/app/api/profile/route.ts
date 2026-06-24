import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

const profileSchema = z.object({
  phone: z
    .string()
    .min(8, "Phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
  college: z.string().min(1, "College is required"),
  courseEnrolled: z.string().min(1, "Course enrolled is required"),
  graduationYear: z.number().int().min(2020).max(2035),
  stream: z.string().min(1, "Stream is required"),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  skills: z.string().max(1000).optional().or(z.literal("")),
  education: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ data: profile });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        phone: parsed.data.phone,
        college: parsed.data.college,
        courseEnrolled: parsed.data.courseEnrolled,
        graduationYear: parsed.data.graduationYear,
        stream: parsed.data.stream,
        resumeUrl: parsed.data.resumeUrl || null,
        linkedinUrl: parsed.data.linkedinUrl || null,
        githubUrl: parsed.data.githubUrl || null,
        bio: parsed.data.bio || null,
        skills: parsed.data.skills || null,
        education: parsed.data.education || null,
      },
      create: {
        userId: session.user.id,
        phone: parsed.data.phone,
        college: parsed.data.college,
        courseEnrolled: parsed.data.courseEnrolled,
        graduationYear: parsed.data.graduationYear,
        stream: parsed.data.stream,
        resumeUrl: parsed.data.resumeUrl || null,
        linkedinUrl: parsed.data.linkedinUrl || null,
        githubUrl: parsed.data.githubUrl || null,
        bio: parsed.data.bio || null,
        skills: parsed.data.skills || null,
        education: parsed.data.education || null,
      },
    });

    // Mark profile as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileCompleted: true },
    });

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
