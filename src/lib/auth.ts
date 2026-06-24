import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/lib/auth.config";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      profileCompleted: boolean;
    };
  }

  interface User {
    role?: Role;
    profileCompleted?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    profileCompleted: boolean;
    picture?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First sign-in — populate token from DB user
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.profileCompleted = dbUser.profileCompleted;
          token.picture = dbUser.image;
        }
      }

      // Allow updating session from client (e.g. after profile setup)
      if (trigger === "update" && session) {
        if (session.profileCompleted !== undefined) {
          token.profileCompleted = session.profileCompleted;
        }
        if (session.image !== undefined) {
          token.picture = session.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profileCompleted = token.profileCompleted;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Create empty student profile for new users
      if (user.id) {
        await prisma.studentProfile.create({
          data: { userId: user.id },
        });
      }
    },
  },
});
