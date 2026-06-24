import { NextResponse } from "next/server";
import { CourseEnrollmentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: session.user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            where: { isPublished: true },
            orderBy: { orderIndex: "asc" },
            include: {
              questions: {
                orderBy: { orderIndex: "asc" },
                include: {
                  progress: {
                    where: { userId: session.user.id },
                    select: { completed: true, completedAt: true },
                  },
                },
              },
              progress: {
                where: { userId: session.user.id },
                select: { completed: true, completedAt: true },
              },
            },
          },
        },
      },
    },
  });

  if (enrollments.length === 0) {
    const javaDsaCourse = await prisma.course.findUnique({
      where: { slug: "java-dsa-foundation" },
      select: { id: true },
    });

    if (javaDsaCourse) {
      await prisma.courseEnrollment.create({
        data: {
          userId: session.user.id,
          courseId: javaDsaCourse.id,
          status: CourseEnrollmentStatus.ENROLLED,
        },
      });

      enrollments = await prisma.courseEnrollment.findMany({
        where: { userId: session.user.id },
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              modules: {
                where: { isPublished: true },
                orderBy: { orderIndex: "asc" },
                include: {
                  questions: {
                    orderBy: { orderIndex: "asc" },
                    include: {
                      progress: {
                        where: { userId: session.user.id },
                        select: { completed: true, completedAt: true },
                      },
                    },
                  },
                  progress: {
                    where: { userId: session.user.id },
                    select: { completed: true, completedAt: true },
                  },
                },
              },
            },
          },
        },
      });
    }
  }

  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  const batchMemberships = await prisma.batchStudent.findMany({
    where: { userId: session.user.id },
    include: {
      batch: {
        include: {
          course: { select: { title: true, slug: true } },
        },
      },
    },
  });
  const batchIds = batchMemberships.map((membership) => membership.batchId);
  const now = new Date();
  const notifications = await prisma.notification.findMany({
    where: {
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        {
          OR: [
            { audience: "all" },
            { audience: "course", courseId: { in: courseIds } },
            { audience: "batch", batchId: { in: batchIds } },
            { audience: "student", targetUserId: session.user.id },
          ],
        },
      ],
    },
    orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    take: 8,
    include: {
      course: { select: { title: true, slug: true } },
      batch: { select: { name: true, schedule: true, meetingLink: true } },
      targetUser: { select: { name: true, email: true } },
      reads: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      phone: true,
      college: true,
      courseEnrolled: true,
      resumeUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      bio: true,
      skills: true,
      education: true,
    },
  });

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      _count: { select: { modules: true } },
    },
  });

  const mappedNotifications = notifications.map(({ reads, ...notification }) => ({
    ...notification,
    read: reads.length > 0,
  }));

  return NextResponse.json({
    data: {
      enrollments,
      notifications: mappedNotifications,
      batches: batchMemberships.map((membership) => membership.batch),
      profile,
      unreadCount: mappedNotifications.filter((notification) => !notification.read).length,
      courses,
    },
  });
}
