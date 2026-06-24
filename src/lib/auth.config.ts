import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod/v4";

const credentialSchema = z.object({
  email: z.email(),
  password: z.string().min(6).optional(),
  otp: z.string().regex(/^\d{6}$/).optional(),
  purpose: z.enum(["signup", "login"]).optional(),
});

/**
 * Auth config shared between full auth.ts and edge middleware.
 * This file MUST NOT import Prisma (not edge-compatible).
 */
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        purpose: { label: "Purpose", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Dynamic import to avoid bundling Prisma in edge
        const { prisma } = await import("@/lib/prisma");
        const { compare, hash } = await import("bcryptjs");
        const { hashOtp, normalizeEmail, otpIdentifier } = await import("@/lib/otp-shared");
        const email = normalizeEmail(parsed.data.email);
        const adminEmail = "admin@levelproedu.com";
        const adminPassword = "Levelpro@2025";

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (
          !user &&
          email === adminEmail &&
          parsed.data.password === adminPassword
        ) {
          user = await prisma.user.create({
            data: {
              email: adminEmail,
              name: "LevelPro Admin",
              hashedPassword: await hash(adminPassword, 12),
              role: "ADMIN",
              emailVerified: new Date(),
              profileCompleted: true,
            },
          });
        }

        if (!user) return null;
        if (!user.isActive) return null;

        let authMethod: "otp" | "password" = "password";

        if (parsed.data.otp) {
          authMethod = "otp";
          const purpose = parsed.data.purpose || "login";
          const token = await prisma.verificationToken.findUnique({
            where: {
              identifier_token: {
                identifier: otpIdentifier(purpose, email),
                token: await hashOtp(email, parsed.data.otp, purpose),
              },
            },
          });

          if (!token || token.expires < new Date()) return null;

          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: token.identifier,
                token: token.token,
              },
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        } else if (parsed.data.password) {
          if (!user.hashedPassword) return null;
          const isValid = await compare(parsed.data.password, user.hashedPassword);
          if (!isValid) return null;
        } else {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            method: authMethod,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;
