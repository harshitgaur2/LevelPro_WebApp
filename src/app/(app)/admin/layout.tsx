import React from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Batches", href: "/admin/batches", icon: Workflow },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin("/admin");

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="code-grid fixed inset-0 opacity-30" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10 lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-blue-300/15 bg-[#061538]/90 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
            <div className="mb-5 rounded-3xl bg-white/[0.045] p-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/10 text-[#67d8ff]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-white">Admin Portal</h2>
              <p className="mt-1 text-sm leading-5 text-blue-100/55">Manage LevelPro learning operations.</p>
            </div>
            <nav className="grid gap-2">
              {adminLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-blue-100/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon className="h-4 w-4 text-[#67d8ff] transition group-hover:scale-110" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
