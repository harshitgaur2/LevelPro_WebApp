import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/profile", "/admin"];
const authPaths = ["/login", "/signup"];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtected = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );
  const isAuthPage = authPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    const isAdmin =
      req.auth?.user?.role === "ADMIN" ||
      req.auth?.user?.email === "admin@levelproedu.com";
    const target = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  if (
    isLoggedIn &&
    nextUrl.pathname.startsWith("/admin") &&
    req.auth?.user?.role &&
    req.auth.user.role !== "ADMIN" &&
    req.auth.user.email !== "admin@levelproedu.com"
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect users with incomplete profiles to setup
  if (
    isLoggedIn &&
    isProtected &&
    !nextUrl.pathname.startsWith("/profile/setup") &&
    req.auth?.user?.profileCompleted === false
  ) {
    return NextResponse.redirect(new URL("/profile/setup", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
