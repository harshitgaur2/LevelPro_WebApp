import React from "react";
import { revalidatePath } from "next/cache";
import { BookOpen, CheckCircle2, Plus, Rows3 } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function createModule(formData: FormData) {
  "use server";

  await requireAdmin("/admin/courses");
  const courseId = String(formData.get("courseId") || "");
  const section = String(formData.get("section") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const lectureCount = Number(formData.get("lectureCount") || 1);
  const description = String(formData.get("description") || "").trim();

  if (!courseId || !section || !title) return;

  const lastModule = await prisma.courseModule.findFirst({
    where: { courseId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  await prisma.courseModule.create({
    data: {
      courseId,
      section,
      title,
      lectureCount: Number.isFinite(lectureCount) ? lectureCount : 1,
      description: description || null,
      orderIndex: (lastModule?.orderIndex || 0) + 1,
      isPublished: true,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/dashboard");
}

function fieldClass() {
  return "h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { questions: true, progress: true } },
        },
      },
      _count: { select: { enrollments: true, batches: true } },
    },
  });
  const primaryCourse = courses[0];
  const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
  const totalQuestions = courses.reduce(
    (total, course) => total + course.modules.reduce((courseTotal, module) => courseTotal + module._count.questions, 0),
    0
  );

  return (
    <div className="space-y-8">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">Courses</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Course structure</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
          Review published courses, modules, lectures, and LeetCode practice links.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Courses", value: courses.length, icon: BookOpen },
          { label: "Modules", value: totalModules, icon: Rows3 },
          { label: "Practice links", value: totalQuestions, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
            <Icon className="h-6 w-6 text-[#67d8ff]" />
            <p className="mt-5 text-3xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-blue-100/48">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-6">
          {courses.map((course) => (
            <article key={course.id} className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{course.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100/62">{course.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#67d8ff]/10 px-3 py-1 text-xs font-bold text-[#67d8ff]">
                    {course._count.enrollments} students
                  </span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-blue-100/62">
                    {course._count.batches} batches
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {course.modules.length ? (
                  course.modules.map((module) => (
                    <div key={module.id} className="grid gap-3 rounded-3xl border border-white/8 bg-white/[0.035] p-4 md:grid-cols-[1fr_130px_130px] md:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100/42">{module.section}</p>
                        <h3 className="mt-1 font-bold text-white">{module.orderIndex}. {module.title}</h3>
                      </div>
                      <p className="text-sm text-blue-100/58">{module.lectureCount} lectures</p>
                      <p className="text-sm text-blue-100/58">{module._count.questions} questions</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">
                    No modules yet.
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/10 text-[#67d8ff]">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Push module</h2>
                <p className="text-sm text-blue-100/55">Add a module to a course.</p>
              </div>
            </div>
            <form action={createModule} className="grid gap-4">
              <select name="courseId" defaultValue={primaryCourse?.id || ""} className={fieldClass()}>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <input name="section" required placeholder="Section, e.g. Advance DS" className={fieldClass()} />
              <input name="title" required placeholder="Module title" className={fieldClass()} />
              <input name="lectureCount" type="number" min={1} max={20} defaultValue={1} className={fieldClass()} />
              <textarea
                name="description"
                rows={4}
                placeholder="Optional module notes"
                className="w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]"
              />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]">
                <Plus className="h-4 w-4" />
                Push module
              </button>
            </form>
          </section>
        </aside>
      </section>
    </div>
  );
}
