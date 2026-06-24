import React from "react";
import { revalidatePath } from "next/cache";
import {
  Bell,
  Clock,
  ExternalLink,
  Link2,
  Megaphone,
  Radio,
  Send,
} from "lucide-react";
import { z } from "zod/v4";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const notificationFormSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(10).max(1200),
  audience: z.enum(["all", "course", "batch", "student"]),
  type: z.enum([
    "CLASS_UPDATE",
    "ASSIGNMENT",
    "CLASS_REMINDER",
    "PDF_RESOURCE",
    "RESOURCE",
    "LIVE_CLASS",
    "PLACEMENT_UPDATE",
    "INTERVIEW_UPDATE",
    "ANNOUNCEMENT",
  ]),
  courseId: z.string().optional(),
  batchId: z.string().optional(),
  targetUserId: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  classLink: z.string().url().optional().or(z.literal("")),
  resourceUrl: z.string().url().optional().or(z.literal("")),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

const notificationTypes = [
  ["CLASS_UPDATE", "Class update"],
  ["CLASS_REMINDER", "Class reminder"],
  ["ASSIGNMENT", "Assignment"],
  ["LIVE_CLASS", "Live class link"],
  ["PDF_RESOURCE", "PDF resource"],
  ["RESOURCE", "Resource link"],
  ["PLACEMENT_UPDATE", "Placement update"],
  ["INTERVIEW_UPDATE", "Interview update"],
  ["ANNOUNCEMENT", "General announcement"],
] as const;

async function createNotification(formData: FormData) {
  "use server";

  const session = await requireAdmin("/admin/notifications");
  const parsed = notificationFormSchema.safeParse({
    title: String(formData.get("title") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    audience: String(formData.get("audience") || "batch"),
    type: String(formData.get("type") || "ANNOUNCEMENT"),
    courseId: String(formData.get("courseId") || ""),
    batchId: String(formData.get("batchId") || ""),
    targetUserId: String(formData.get("targetUserId") || ""),
    pdfUrl: String(formData.get("pdfUrl") || "").trim(),
    classLink: String(formData.get("classLink") || "").trim(),
    resourceUrl: String(formData.get("resourceUrl") || "").trim(),
    scheduledAt: String(formData.get("scheduledAt") || ""),
    expiresAt: String(formData.get("expiresAt") || ""),
  });

  if (!parsed.success) return;
  if (parsed.data.audience === "course" && !parsed.data.courseId) return;
  if (parsed.data.audience === "batch" && !parsed.data.batchId) return;
  if (parsed.data.audience === "student" && !parsed.data.targetUserId) return;

  await prisma.notification.create({
    data: {
      title: parsed.data.title,
      message: parsed.data.message,
      audience: parsed.data.audience,
      type: parsed.data.type,
      courseId: parsed.data.audience === "course" ? parsed.data.courseId : null,
      batchId: parsed.data.audience === "batch" ? parsed.data.batchId : null,
      targetUserId: parsed.data.audience === "student" ? parsed.data.targetUserId : null,
      pdfUrl: parsed.data.pdfUrl || null,
      classLink: parsed.data.classLink || null,
      resourceUrl: parsed.data.resourceUrl || null,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

function fieldClass() {
  return "h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

function displayDate(value: Date | null) {
  if (!value) return "Immediate";

  return value.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminNotificationsPage() {
  const [courses, batches, students, notifications] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, orderBy: { title: "asc" } }),
    prisma.batch.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { name: "asc" },
      include: { course: { select: { title: true } } },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
    prisma.notification.findMany({
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      take: 14,
      include: {
        course: { select: { title: true } },
        batch: { select: { name: true } },
        targetUser: { select: { name: true, email: true } },
        _count: { select: { reads: true } },
      },
    }),
  ]);

  const recentUnreadEstimate = notifications.reduce((total, notification) => total + notification._count.reads, 0);

  return (
    <div className="space-y-10">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">Push Notifications</p>
        <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Class notifications</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
              Send announcements, reminders, assignments, live links, placement updates, and resources to courses, batches, or individual students.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-2xl font-extrabold text-white">{notifications.length}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100/48">recent</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-2xl font-extrabold text-white">{recentUnreadEstimate}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100/48">reads</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <form action={createNotification} className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff1683]/12 text-pink-100">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Create notification</h2>
              <p className="text-sm text-blue-100/55">Choose one target type, then fill its matching selector.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <input name="title" required minLength={3} maxLength={120} placeholder="Notification title" className={fieldClass()} />
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={1200}
              rows={5}
              placeholder="Message for students"
              className="w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select name="type" defaultValue="CLASS_UPDATE" className={fieldClass()}>
                {notificationTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select name="audience" defaultValue="batch" className={fieldClass()}>
                <option value="batch">Selected batch</option>
                <option value="student">Individual student</option>
                <option value="course">Selected course</option>
                <option value="all">All students</option>
              </select>
              <select name="batchId" defaultValue={batches[0]?.id || ""} className={fieldClass()}>
                <option value="">No batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} · {batch.course.title}
                  </option>
                ))}
              </select>
              <select name="courseId" defaultValue={courses[0]?.id || ""} className={fieldClass()}>
                <option value="">No course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <select name="targetUserId" defaultValue="" className={`${fieldClass()} md:col-span-2`}>
                <option value="">No individual student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || student.email} {student.email ? `· ${student.email}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-blue-100/68">Date/time</span>
                <input name="scheduledAt" type="datetime-local" className={fieldClass()} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-blue-100/68">Expiry</span>
                <input name="expiresAt" type="datetime-local" className={fieldClass()} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input name="classLink" type="url" placeholder="Optional class link" className={fieldClass()} />
              <input name="pdfUrl" type="url" placeholder="Optional PDF link" className={fieldClass()} />
              <input name="resourceUrl" type="url" placeholder="Optional resource URL" className={fieldClass()} />
            </div>
            <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ff1683] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e61477]">
              <Bell className="h-4 w-4" />
              Push notification
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-extrabold text-white">Recent notifications</h2>
          <p className="mt-2 text-sm text-blue-100/55">Matching students see these immediately on their dashboard.</p>
          <div className="mt-6 grid gap-4">
            {notifications.length ? (
              notifications.map((notification) => (
                <article key={notification.id} className="rounded-3xl border border-white/8 bg-[#020817]/45 p-5 transition hover:border-[#67d8ff]/35 hover:bg-[#0a1f50]/70">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#67d8ff]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#67d8ff]">
                      {notification.type.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100/52">
                      {notification.batch?.name || notification.course?.title || notification.targetUser?.name || notification.targetUser?.email || "All students"}
                    </span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100/52">
                      {notification._count.reads} read
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100/62">{notification.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {notification.classLink && (
                      <a href={notification.classLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff1683]/12 px-3 py-1.5 text-xs font-bold text-pink-100 hover:bg-[#ff1683] hover:text-white">
                        <Radio className="h-3.5 w-3.5" />
                        Class
                      </a>
                    )}
                    {notification.pdfUrl && (
                      <a href={notification.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5 text-xs font-bold text-blue-100 hover:bg-white/15">
                        <ExternalLink className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    )}
                    {notification.resourceUrl && (
                      <a href={notification.resourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5 text-xs font-bold text-blue-100 hover:bg-white/15">
                        <Link2 className="h-3.5 w-3.5" />
                        Resource
                      </a>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-blue-100/42">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#67d8ff]" />
                      {displayDate(notification.scheduledAt || notification.createdAt)}
                    </span>
                    {notification.expiresAt && <span>Expires {displayDate(notification.expiresAt)}</span>}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/12 p-10 text-center">
                <Megaphone className="mx-auto h-8 w-8 text-[#67d8ff]" />
                <p className="mt-3 font-semibold text-white">No notifications yet</p>
                <p className="mt-1 text-sm text-blue-100/55">Create your first class update for a batch.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
