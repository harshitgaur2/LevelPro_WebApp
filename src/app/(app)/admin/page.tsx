import React from "react";
import Link from "next/link";
import { Bell, BookOpen, CalendarDays, ChevronRight, Users, Workflow } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalStudents, activeBatches, totalCourses, pendingNotifications, recentNotifications, batches] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.batch.count({ where: { isActive: true, isArchived: false } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.notification.count({
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      }),
      prisma.notification.findMany({
        take: 5,
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        include: {
          batch: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.batch.findMany({
        take: 4,
        orderBy: [{ isArchived: "asc" }, { createdAt: "desc" }],
        include: {
          course: { select: { title: true } },
          _count: { select: { students: true } },
        },
      }),
    ]);

  const stats = [
    { label: "Total students", value: totalStudents, icon: Users, href: "/admin/students" },
    { label: "Active batches", value: activeBatches, icon: Workflow, href: "/admin/batches" },
    { label: "Total courses", value: totalCourses, icon: BookOpen, href: "/admin/courses" },
    { label: "Pending notifications", value: pendingNotifications, icon: Bell, href: "/admin/notifications" },
  ];
  const maxBatchStudents = Math.max(...batches.map((batch) => batch._count.students), 1);

  return (
    <div className="space-y-10">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">LevelPro Admin</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal text-white sm:text-5xl">
          Learning operations dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
          Track students, batches, courses, and class updates from one clean admin workspace.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }, index) => (
          <Link
            key={label}
            href={href}
            className="group animate-slide-up rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/40 hover:bg-white/[0.065]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/10 text-[#67d8ff]">
                <Icon className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-blue-100/35 transition group-hover:translate-x-1 group-hover:text-[#67d8ff]" />
            </div>
            <p className="mt-6 text-4xl font-extrabold text-white">{value}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-blue-100/48">{label}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Recent batches</h2>
              <p className="mt-1 text-sm text-blue-100/55">Quick view of cohort activity.</p>
            </div>
            <Link href="/admin/batches" className="text-sm font-bold text-[#67d8ff] transition hover:text-white">
              Manage
            </Link>
          </div>
          <div className="grid gap-4">
            {batches.length ? (
              batches.map((batch) => (
                <div key={batch.id} className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{batch.name}</h3>
                      <p className="mt-1 text-sm text-blue-100/58">{batch.course.title}</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                      {batch._count.students} students
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-100/52">
                    <CalendarDays className="h-4 w-4 text-[#67d8ff]" />
                    {batch.schedule || "Schedule not set"}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">
                No batches yet. Create your first batch to organize students.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Class notifications</h2>
              <p className="mt-1 text-sm text-blue-100/55">Latest updates pushed to students.</p>
            </div>
            <Link href="/admin/notifications" className="text-sm font-bold text-[#67d8ff] transition hover:text-white">
              Create
            </Link>
          </div>
          <div className="grid gap-4">
            {recentNotifications.length ? (
              recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                  <span className="rounded-full bg-[#67d8ff]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#67d8ff]">
                    {notification.type.replaceAll("_", " ")}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">{notification.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-blue-100/58">{notification.message}</p>
                  <p className="mt-3 text-xs font-semibold text-blue-100/42">
                    {notification.batch?.name || notification.course?.title || "All students"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">
                No notifications yet. Push a class update when your next batch starts.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Batch strength analytics</h2>
            <p className="mt-1 text-sm text-blue-100/55">A quick visual scan of cohort size and admin attention areas.</p>
          </div>
          <Link href="/admin/batches" className="text-sm font-bold text-[#67d8ff] transition hover:text-white">
            Open batches
          </Link>
        </div>
        <div className="grid gap-4">
          {batches.length ? (
            batches.map((batch) => (
              <div key={batch.id} className="rounded-3xl border border-white/8 bg-[#020817]/45 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{batch.name}</p>
                    <p className="mt-1 text-sm text-blue-100/52">{batch.course.title}</p>
                  </div>
                  <span className="rounded-full bg-[#67d8ff]/10 px-3 py-1 text-xs font-bold text-[#67d8ff]">
                    {batch._count.students} students
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd]"
                    style={{ width: `${Math.max(8, (batch._count.students / maxBatchStudents) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">
              Create a batch to see analytics here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
