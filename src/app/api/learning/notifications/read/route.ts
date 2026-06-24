import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const readNotificationSchema = z.object({
  notificationId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = readNotificationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await prisma.notificationRead.upsert({
    where: {
      notificationId_userId: {
        notificationId: parsed.data.notificationId,
        userId: session.user.id,
      },
    },
    update: { readAt: new Date() },
    create: {
      notificationId: parsed.data.notificationId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
