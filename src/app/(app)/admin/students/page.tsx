import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  ArrowUpDown,
  Download,
  Eye,
  GitBranch,
  Link2,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StudentsPageProps = {
  searchParams: Promise<{ q?: string; course?: string; status?: string; sort?: string }>;
};

type StudentForProgress = {
  courseEnrollments: {
    course: {
      modules: {
        questions: { id: string }[];
      }[];
    };
  }[];
  questionProgress: { questionId: string }[];
};

async function toggleStudentStatus(formData: FormData) {
  "use server";

  await requireAdmin("/admin/students");
  const id = String(formData.get("id") || "");
  const isActive = String(formData.get("isActive") || "false") === "true";

  if (!id) return;

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
}

function progressForStudent(student: StudentForProgress) {
  const completedQuestionIds = new Set(student.questionProgress.map((progress) => progress.questionId));
  const modules = student.courseEnrollments.flatMap((enrollment) => enrollment.course.modules);
  const questionIds = modules.flatMap((module) => module.questions.map((question) => question.id));
  const totalQuestions = questionIds.length;
  const completedQuestions = questionIds.filter((id) => completedQuestionIds.has(id)).length;
  const completedModules = modules.filter((module) => {
    const moduleQuestionIds = module.questions.map((question) => question.id);
    return moduleQuestionIds.length > 0 && moduleQuestionIds.every((id) => completedQuestionIds.has(id));
  }).length;
  const percentage = totalQuestions ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    completedQuestions,
    totalModules: modules.length,
    completedModules,
    percentage,
  };
}

function avatarMarkup(name: string | null, image: string | null) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name || "Student"} className="h-12 w-12 rounded-2xl object-cover" />
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/12 text-sm font-extrabold text-[#67d8ff]">
      {getInitials(name || "Student")}
    </div>
  );
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const courseFilter = params.course || "";
  const statusFilter = params.status || "";
  const sort = params.sort || "newest";

  const [courses, students] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(statusFilter === "active" ? { isActive: true } : {}),
        ...(statusFilter === "inactive" ? { isActive: false } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { studentProfile: { college: { contains: query, mode: "insensitive" } } },
                { studentProfile: { phone: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(courseFilter
          ? {
              courseEnrollments: {
                some: { courseId: courseFilter },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: true,
        batchMemberships: {
          include: {
            batch: { include: { course: { select: { title: true } } } },
          },
        },
        questionProgress: {
          where: { completed: true },
          select: { questionId: true },
        },
        courseEnrollments: {
          include: {
            course: {
              include: {
                modules: {
                  where: { isPublished: true },
                  include: { questions: { select: { id: true } } },
                },
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            loginHistory: true,
          },
        },
      },
    }),
  ]);

  const studentsWithProgress = students.map((student) => ({
    ...student,
    progress: progressForStudent(student),
  }));

  const sortedStudents = [...studentsWithProgress].sort((a, b) => {
    if (sort === "name") return (a.name || a.email || "").localeCompare(b.name || b.email || "");
    if (sort === "progress") return b.progress.percentage - a.progress.percentage;
    if (sort === "last-login") return (b.lastLoginAt?.getTime() || 0) - (a.lastLoginAt?.getTime() || 0);
    if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const completedProfiles = students.filter((student) => student.profileCompleted).length;
  const activeStudents = students.filter((student) => student.isActive).length;

  return (
    <div className="space-y-10">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">Manage Students</p>
        <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Student database</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
              Search, filter, sort, open detailed profiles, and monitor course progress, batches, resumes, links, and account health.
            </p>
          </div>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.055] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Students", value: students.length, icon: Users },
          { label: "Active", value: activeStudents, icon: ShieldCheck },
          { label: "Profiles complete", value: completedProfiles, icon: UserCheck },
          { label: "Courses", value: courses.length, icon: Search },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
            <Icon className="h-6 w-6 text-[#67d8ff]" />
            <p className="mt-5 text-3xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-blue-100/48">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#061538]/90 shadow-2xl shadow-blue-950/35 backdrop-blur-xl">
        <form className="grid gap-4 border-b border-white/10 p-5 lg:grid-cols-[1fr_220px_180px_190px_auto] lg:items-end sm:p-6">
          <label className="block">
            <span className="text-sm font-semibold text-blue-100/68">Search</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Name, email, phone, or college"
              className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-blue-100/68">Course</span>
            <select
              name="course"
              defaultValue={courseFilter}
              className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none focus:border-[#67d8ff]"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-blue-100/68">Status</span>
            <select
              name="status"
              defaultValue={statusFilter}
              className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none focus:border-[#67d8ff]"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-blue-100/68">Sort</span>
            <select
              name="sort"
              defaultValue={sort}
              className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none focus:border-[#67d8ff]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="last-login">Last login</option>
            </select>
          </label>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff1683] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e61477]">
            <ArrowUpDown className="h-4 w-4" />
            Apply
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.025] text-xs uppercase tracking-[0.12em] text-blue-100/48">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Profile</th>
                <th className="px-6 py-4 font-semibold">Course / Batch</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Links</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {sortedStudents.map((student) => {
                const enrollment = student.courseEnrollments[0];
                const batch = student.batchMemberships[0]?.batch;

                return (
                  <tr key={student.id} className="align-top text-blue-50/82 transition hover:bg-white/[0.035]">
                    <td className="px-6 py-5">
                      <div className="flex min-w-64 items-start gap-4">
                        {avatarMarkup(student.name, student.image)}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-white">{student.name || "Unnamed Student"}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                              student.isActive ? "bg-emerald-400/10 text-emerald-200" : "bg-red-500/10 text-red-200"
                            }`}>
                              {student.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="mt-1 text-blue-100/58">{student.email}</p>
                          <p className="mt-2 text-xs text-blue-100/42">{student.studentProfile?.phone || "No phone"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={student.profileCompleted ? "font-bold text-emerald-300" : "font-bold text-pink-300"}>
                        {student.profileCompleted ? "Complete" : "Pending"}
                      </span>
                      <p className="mt-1 text-blue-100/58">{student.studentProfile?.college || "No college added"}</p>
                      <p className="mt-1 text-xs text-blue-100/42">{student.studentProfile?.stream || "No stream"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">{enrollment?.course.title || student.studentProfile?.courseEnrolled || "Not enrolled"}</p>
                      <p className="mt-1 text-blue-100/58">{batch?.name || "No batch assigned"}</p>
                      <p className="mt-1 text-xs text-blue-100/42">{batch?.schedule || "Schedule pending"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex min-w-44 items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd]"
                            style={{ width: `${student.progress.percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-extrabold text-[#67d8ff]">{student.progress.percentage}%</span>
                      </div>
                      <p className="mt-2 text-xs text-blue-100/48">
                        {student.progress.completedQuestions}/{student.progress.totalQuestions} questions · {student.progress.completedModules}/{student.progress.totalModules} modules
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {student.studentProfile?.resumeUrl && (
                          <a href={student.studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/8 px-3 py-1.5 text-xs font-bold text-[#67d8ff] transition hover:bg-white/15">
                            Resume
                          </a>
                        )}
                        {student.studentProfile?.linkedinUrl && (
                          <a href={student.studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-xl bg-white/8 text-blue-100 transition hover:bg-white/15">
                            <Link2 className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {student.studentProfile?.githubUrl && (
                          <a href={student.studentProfile.githubUrl} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-xl bg-white/8 text-blue-100 transition hover:bg-white/15">
                            <GitBranch className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {!student.studentProfile?.resumeUrl && !student.studentProfile?.linkedinUrl && !student.studentProfile?.githubUrl && (
                          <span className="text-blue-100/42">No links</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-blue-100/58">
                      <p>{student.lastLoginAt ? student.lastLoginAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Never logged in"}</p>
                      <p className="mt-1 text-xs text-blue-100/42">
                        {student._count.loginHistory} logins · {student._count.applications} applications
                      </p>
                      <p className="mt-1 text-xs text-blue-100/42">
                        Joined {student.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex min-w-44 flex-wrap gap-2">
                        <Link href={`/admin/students/${student.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#67d8ff]/10 px-3 text-xs font-bold text-[#67d8ff] transition hover:bg-[#67d8ff] hover:text-[#020817]">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <form action={toggleStudentStatus}>
                          <input type="hidden" name="id" value={student.id} />
                          <input type="hidden" name="isActive" value={String(!student.isActive)} />
                          <button className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                            student.isActive
                              ? "border border-red-300/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                              : "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
                          }`}>
                            {student.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            {student.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedStudents.length === 0 && (
          <div className="p-12 text-center">
            <Users className="mx-auto h-9 w-9 text-[#67d8ff]" />
            <p className="mt-4 font-bold text-white">No students match this filter</p>
            <p className="mt-1 text-sm text-blue-100/58">Try a broader search or clear the filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
