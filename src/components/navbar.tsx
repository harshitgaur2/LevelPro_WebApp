"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BookOpen, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./ui/logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Courses", href: "/#courses" },
    { name: "Founder", href: "/#founder" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020817]/82 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex shrink-0 items-center">
              <Logo />
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium text-blue-100/70 transition hover:bg-white/8 hover:text-white",
                    pathname === link.href && "bg-white/10 text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-100/70 transition hover:bg-white/8 hover:text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </Link>
                  <Link
                    href="/admin/students"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-100/70 transition hover:bg-white/8 hover:text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Students
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {status === "loading" ? (
              <div className="h-9 w-28 animate-pulse rounded-xl bg-white/10" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    leftIcon={<LayoutDashboard className="h-4 w-4" />}
                  >
                    My Learning
                  </Button>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-blue-100/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="accent" size="sm" className="bg-[#ff0183] hover:bg-[#e60075]">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-blue-100 lg:hidden"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#020817] px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/80 hover:bg-white/8 hover:text-white"
              >
                <BookOpen className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  href="/admin/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/80 hover:bg-white/8 hover:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  Courses Admin
                </Link>
                <Link
                  href="/admin/students"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-100/80 hover:bg-white/8 hover:text-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Students
                </Link>
              </>
            )}
          </div>
          <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 text-sm text-blue-100/80">
                  <User className="h-4 w-4" />
                  {session.user?.email}
                </div>
                <Button
                  variant="secondary"
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="accent" className="w-full bg-[#ff0183] hover:bg-[#e60075]">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
