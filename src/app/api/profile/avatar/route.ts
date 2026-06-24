import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const avatarSchema = z.object({
  image: z
    .string()
    .min(1, "Profile picture is required")
    .max(900_000, "Profile picture must be under 650 KB")
    .refine(
      (value) => value.startsWith("data:image/jpeg;base64,") || value.startsWith("data:image/png;base64,") || value.startsWith("data:image/webp;base64,"),
      "Upload a JPG, PNG, or WebP image"
    ),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = avatarSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { image: parsed.data.image },
    select: { image: true },
  });

  return NextResponse.json({ data: user });
}
