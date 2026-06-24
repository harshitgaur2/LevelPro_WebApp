import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { generateOtp, normalizeEmail, saveOtp, sendOtpEmail } from "@/lib/otp";

const requestOtpSchema = z.object({
  email: z.email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  purpose: z.enum(["signup", "login"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const { name, purpose } = parsed.data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });

    if (purpose === "signup") {
      if (existingUser?.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { name },
        });

        if (!existingUser.studentProfile) {
          await prisma.studentProfile.create({
            data: { userId: existingUser.id },
          });
        }
      } else {
        await prisma.user.create({
          data: {
            name,
            email,
            studentProfile: { create: {} },
          },
        });
      }
    }

    if (purpose === "login" && !existingUser) {
      return NextResponse.json(
        { error: "No account found for this email. Please sign up first." },
        { status: 404 }
      );
    }

    const code = generateOtp();
    await saveOtp(email, code, purpose);
    const delivery = await sendOtpEmail(email, code, purpose);

    return NextResponse.json({
      message: "OTP sent to your email inbox.",
      delivered: delivery.delivered,
    });
  } catch (error) {
    console.error("OTP request error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("Email delivery is not configured")
            ? error.message
            : "Could not send OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
