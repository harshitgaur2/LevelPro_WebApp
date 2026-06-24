import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashOtp, normalizeEmail, otpIdentifier, type OtpPurpose } from "@/lib/otp-shared";

const OTP_TTL_MINUTES = 10;

export { normalizeEmail };

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export async function saveOtp(email: string, code: string, purpose: OtpPurpose) {
  const identifier = otpIdentifier(purpose, email);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: await hashOtp(email, code, purpose),
      expires: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });
}

export async function sendOtpEmail(email: string, code: string, purpose: OtpPurpose) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "LevelPro <noreply@levelpro.in>";
  const subject =
    purpose === "signup"
      ? "Verify your LevelPro signup"
      : "Your LevelPro login code";

  const text = [
    `Your LevelPro OTP is ${code}.`,
    `It expires in ${OTP_TTL_MINUTES} minutes.`,
    "If you did not request this code, you can ignore this email.",
  ].join("\n\n");

  if (!apiKey) {
    throw new Error(
      "Email delivery is not configured. Add RESEND_API_KEY and a verified EMAIL_FROM sender in .env."
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h1 style="color: #001c80;">LevelPro verification code</h1>
          <p>Use this OTP to ${purpose === "signup" ? "finish creating" : "log in to"} your LevelPro account.</p>
          <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #ff0183;">${code}</p>
          <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send OTP email: ${body}`);
  }

  return { delivered: true };
}
