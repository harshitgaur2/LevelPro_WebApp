import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const progressSchema = z.object({
  moduleId: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
  completed: z.boolean(),
}).refine((value) => value.moduleId || value.questionId, {
  message: "moduleId or questionId is required",
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = progressSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  if (parsed.data.questionId) {
    const question = await prisma.practiceQuestion.findUnique({
      where: { id: parsed.data.questionId },
      include: {
        module: {
          select: {
            id: true,
            courseId: true,
            questions: { select: { id: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: question.module.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Question is not enrolled for this user" }, { status: 403 });
    }

    const progress = await prisma.questionProgress.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId: parsed.data.questionId,
        },
      },
      update: {
        completed: parsed.data.completed,
        completedAt: parsed.data.completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        questionId: parsed.data.questionId,
        completed: parsed.data.completed,
        completedAt: parsed.data.completed ? new Date() : null,
      },
    });

    const completedQuestions = await prisma.questionProgress.count({
      where: {
        userId: session.user.id,
        completed: true,
        questionId: { in: question.module.questions.map((item) => item.id) },
      },
    });
    const moduleCompleted =
      question.module.questions.length > 0 &&
      completedQuestions === question.module.questions.length;

    await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: question.module.id,
        },
      },
      update: {
        completed: moduleCompleted,
        completedAt: moduleCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        moduleId: question.module.id,
        completed: moduleCompleted,
        completedAt: moduleCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({ data: progress });
  }

  const moduleId = parsed.data.moduleId!;

  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      userId: session.user.id,
      course: {
        modules: {
          some: { id: moduleId },
        },
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Module is not enrolled for this user" }, { status: 403 });
  }

  const progress = await prisma.moduleProgress.upsert({
    where: {
      userId_moduleId: {
        userId: session.user.id,
        moduleId,
      },
    },
    update: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
    create: {
      userId: session.user.id,
      moduleId,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  return NextResponse.json({ data: progress });
}
