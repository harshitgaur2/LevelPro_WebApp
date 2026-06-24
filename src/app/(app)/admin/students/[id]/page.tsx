import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GitBranch,
  GraduationCap,
  KeyRound,
  Link2,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function updateStudent(formData: FormData) {
  "use server";

  await requireAdmin("/admin/students");
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const college = String(formData.get("college") || "").trim();
  const courseEnrolled = String(formData.get("courseEnrolled") || "").trim();
  const graduationYearValue = String(formData.get("graduationYear") || "").trim();
  const stream = String(formData.get("stream") || "").trim();
  const resumeUrl = String(formData.get("resumeUrl") || "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") || "").trim();
  const githubUrl = String(formData.get("githubUrl") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const skills = String(formData.get("skills") || "").trim();
  const education = String(formData.get("education") || "").trim();
  const graduationYear = graduationYearValue ? Number(graduationYearValue) : null;

  if (!id || !email) return;

  const profileCompleted = Boolean(phone && college && courseEnrolled && stream);

  await prisma.user.update({
    where: { id },
    data: {
      name: name || null,
      email,
      profileCompleted,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: id },
    update: {
      phone: phone || null,
      college: college || null,
      courseEnrolled: courseEnrolled || null,
      graduationYear,
      stream: stream || null,
      resumeUrl: resumeUrl || null,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      bio: bio || null,
      skills: skills || null,
      education: education || null,
    },
    create: {
      userId: id,
      phone: phone || null,
      college: college || null,
      courseEnrolled: courseEnrolled || null,
      graduationYear,
      stream: stream || null,
      resumeUrl: resumeUrl || null,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      bio: bio || null,
      skills: skills || null,
      education: education || null,
    },
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
}

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

async function resetStudentPassword(formData: FormData) {
  "use server";

  await requireAdmin("/admin/students");
  const id = String(formData.get("id") || "");
  const newPassword = String(formData.get("newPassword") || "LevelPro@123").trim();

  if (!id || newPassword.length < 8) return;

  await prisma.user.update({
    where: { id },
    data: { hashedPassword: await hash(newPassword, 12) },
  });

  revalidatePath(`/admin/students/${id}`);
}

async function deleteStudent(formData: FormData) {
  "use server";

  await requireAdmin("/admin/students");
  const id = String(formData.get("id") || "");

  if (!id) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

function inputClass() {
  return "h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

function textareaClass() {
  return "w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

function progressForEnrollment(enrollment: {
  course: {
    modules: {
      title: string;
      questions: { id: string }[];
    }[];
  };
}, completedQuestionIds: Set<string>) {
  const modules = enrollment.course.modules;
  const questionIds = modules.flatMap((module) => module.questions.map((question) => question.id));
  const completedQuestions = questionIds.filter((id) => completedQuestionIds.has(id)).length;
  const completedModules = modules.filter((module) => {
    const moduleQuestionIds = module.questions.map((question) => question.id);
    return moduleQuestionIds.length > 0 && moduleQuestionIds.every((id) => completedQuestionIds.has(id));
  }).length;
  const percentage = questionIds.length ? Math.round((completedQuestions / questionIds.length) * 100) : 0;

  return {
    totalQuestions: questionIds.length,
    completedQuestions,
    totalModules: modules.length,
    completedModules,
    percentage,
  };
}

function avatarBlock(name: string | null, image: string | null) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name || "Student"} className="h-24 w-24 rounded-[1.75rem] object-cover" />
    );
  }

  return (
    <div className="grid h-24 w-24 place-items-center rounded-[1.75rem] bg-[#67d8ff]/12 text-2xl font-extrabold text-[#67d8ff]">
      {getInitials(name || "Student")}
    </div>
  );
}

export default async function AdminStudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = await prisma.user.findFirst({
    where: { id, role: "STUDENT" },
    include: {
      studentProfile: true,
      batchMemberships: {
        include: {
          batch: { include: { course: { select: { title: true, slug: true } } } },
        },
        orderBy: { assignedAt: "desc" },
      },
      questionProgress: {
        where: { completed: true },
        select: { questionId: true },
      },
      courseEnrollments: {
        orderBy: { enrolledAt: "desc" },
        include: {
          course: {
            include: {
              modules: {
                where: { isPublished: true },
                orderBy: { orderIndex: "asc" },
                include: { questions: { select: { id: true } } },
              },
            },
          },
        },
      },
      loginHistory: {
        orderBy: { loggedInAt: "desc" },
        take: 10,
      },
      applications: {
        orderBy: { appliedAt: "desc" },
        take: 8,
      },
    },
  });

  if (!student) {
    notFound();
  }

  const completedQuestionIds = new Set(student.questionProgress.map((progress) => progress.questionId));
  const primaryProgress = student.courseEnrollments[0]
    ? progressForEnrollment(student.courseEnrollments[0], completedQuestionIds)
    : null;

  return (
    <div className="space-y-10">
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm font-bold text-blue-100/62 transition hover:text-[#67d8ff]">
        <ArrowLeft className="h-4 w-4" />
        Back to students
      </Link>

      <header className="grid gap-8 rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {avatarBlock(student.name, student.image)}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                student.isActive ? "bg-emerald-400/10 text-emerald-200" : "bg-red-500/10 text-red-200"
              }`}>
                {student.isActive ? "Active" : "Inactive"}
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100/52">
                {student.profileCompleted ? "Profile complete" : "Profile pending"}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl">{student.name || "Unnamed Student"}</h1>
            <p className="mt-3 text-lg text-blue-100/65">{student.email}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-72">
          <form action={toggleStudentStatus}>
            <input type="hidden" name="id" value={student.id} />
            <input type="hidden" name="isActive" value={String(!student.isActive)} />
            <button className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition ${
              student.isActive
                ? "border border-red-300/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                : "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
            }`}>
              {student.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {student.isActive ? "Deactivate" : "Activate"}
            </button>
          </form>
          <form action={deleteStudent}>
            <input type="hidden" name="id" value={student.id} />
            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/20">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Course progress", value: `${primaryProgress?.percentage || 0}%`, icon: CheckCircle2 },
          { label: "Questions", value: primaryProgress ? `${primaryProgress.completedQuestions}/${primaryProgress.totalQuestions}` : "0/0", icon: BookOpen },
          { label: "Modules", value: primaryProgress ? `${primaryProgress.completedModules}/${primaryProgress.totalModules}` : "0/0", icon: GraduationCap },
          { label: "Logins", value: student.loginHistory.length, icon: UserRound },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <Icon className="h-6 w-6 text-[#67d8ff]" />
            <p className="mt-5 text-3xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-blue-100/48">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form action={updateStudent} className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 sm:p-8">
          <input type="hidden" name="id" value={student.id} />
          <h2 className="text-2xl font-extrabold text-white">Edit student profile</h2>
          <p className="mt-2 text-sm text-blue-100/55">Updates are saved directly to the student profile visible in admin.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <input name="name" defaultValue={student.name || ""} placeholder="Full name" className={inputClass()} />
            <input name="email" type="email" required defaultValue={student.email || ""} placeholder="Email" className={inputClass()} />
            <input name="phone" defaultValue={student.studentProfile?.phone || ""} placeholder="Phone" className={inputClass()} />
            <input name="college" defaultValue={student.studentProfile?.college || ""} placeholder="College" className={inputClass()} />
            <input name="courseEnrolled" defaultValue={student.studentProfile?.courseEnrolled || ""} placeholder="Course enrolled" className={inputClass()} />
            <input name="stream" defaultValue={student.studentProfile?.stream || ""} placeholder="Stream / Major" className={inputClass()} />
            <input name="graduationYear" type="number" min={2020} max={2035} defaultValue={student.studentProfile?.graduationYear || ""} placeholder="Graduation year" className={inputClass()} />
            <input name="resumeUrl" type="url" defaultValue={student.studentProfile?.resumeUrl || ""} placeholder="Resume URL" className={inputClass()} />
            <input name="linkedinUrl" type="url" defaultValue={student.studentProfile?.linkedinUrl || ""} placeholder="LinkedIn URL" className={inputClass()} />
            <input name="githubUrl" type="url" defaultValue={student.studentProfile?.githubUrl || ""} placeholder="GitHub URL" className={inputClass()} />
          </div>

          <div className="mt-4 grid gap-4">
            <textarea name="bio" rows={4} defaultValue={student.studentProfile?.bio || ""} placeholder="Bio" className={textareaClass()} />
            <textarea name="skills" rows={3} defaultValue={student.studentProfile?.skills || ""} placeholder="Skills" className={textareaClass()} />
            <textarea name="education" rows={3} defaultValue={student.studentProfile?.education || ""} placeholder="Education" className={textareaClass()} />
          </div>

          <button className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff1683] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e61477]">
            Save student details
          </button>
        </form>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-white">Profile links</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {student.studentProfile?.resumeUrl && (
                <a href={student.studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-[#67d8ff]/10 px-4 py-3 text-sm font-bold text-[#67d8ff] transition hover:bg-[#67d8ff] hover:text-[#020817]">
                  View resume
                </a>
              )}
              {student.studentProfile?.linkedinUrl && (
                <a href={student.studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-white/15">
                  <Link2 className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {student.studentProfile?.githubUrl && (
                <a href={student.studentProfile.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-white/15">
                  <GitBranch className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {!student.studentProfile?.resumeUrl && !student.studentProfile?.linkedinUrl && !student.studentProfile?.githubUrl && (
                <p className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-blue-100/55">No profile links added yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-white">Reset password</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100/58">Set a temporary password for password-based login.</p>
            <form action={resetStudentPassword} className="mt-5 grid gap-3">
              <input type="hidden" name="id" value={student.id} />
              <input name="newPassword" type="text" minLength={8} defaultValue="LevelPro@123" className={inputClass()} />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#67d8ff]/35 bg-[#67d8ff]/10 px-5 text-sm font-bold text-[#67d8ff] transition hover:bg-[#67d8ff] hover:text-[#020817]">
                <KeyRound className="h-4 w-4" />
                Reset password
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-white">Enrollments and batches</h2>
          <div className="mt-6 grid gap-4">
            {student.courseEnrollments.map((enrollment) => {
              const stats = progressForEnrollment(enrollment, completedQuestionIds);
              return (
                <div key={enrollment.id} className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{enrollment.course.title}</p>
                      <p className="mt-1 text-sm text-blue-100/52">{enrollment.status}</p>
                    </div>
                    <span className="font-extrabold text-[#67d8ff]">{stats.percentage}%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd]" style={{ width: `${stats.percentage}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-blue-100/48">{stats.completedQuestions}/{stats.totalQuestions} questions · {stats.completedModules}/{stats.totalModules} modules</p>
                </div>
              );
            })}
            {student.batchMemberships.map((membership) => (
              <div key={membership.id} className="rounded-3xl border border-white/8 bg-white/[0.035] p-5">
                <p className="font-bold text-white">{membership.batch.name}</p>
                <p className="mt-1 text-sm text-blue-100/52">{membership.batch.course.title}</p>
                <p className="mt-2 text-sm text-blue-100/58">{membership.batch.schedule || "Schedule pending"}</p>
              </div>
            ))}
            {!student.courseEnrollments.length && !student.batchMemberships.length && (
              <p className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">No course or batch assigned yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold text-white">Login history</h2>
          <div className="mt-6 grid gap-3">
            {student.loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
                <span className="text-sm font-bold text-white">{login.method}</span>
                <span className="text-sm text-blue-100/55">{login.loggedInAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
            ))}
            {!student.loginHistory.length && (
              <p className="rounded-3xl border border-dashed border-white/12 p-8 text-center text-blue-100/58">No login history yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
