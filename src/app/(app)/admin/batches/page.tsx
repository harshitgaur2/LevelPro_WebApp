import React from "react";
import { revalidatePath } from "next/cache";
import {
  Archive,
  CalendarDays,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  Workflow,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function createBatch(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const name = String(formData.get("name") || "").trim();
  const courseId = String(formData.get("courseId") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const instructorName = String(formData.get("instructorName") || "").trim();
  const meetingLink = String(formData.get("meetingLink") || "").trim();
  const schedule = String(formData.get("schedule") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !courseId) return;

  await prisma.batch.create({
    data: {
      name,
      courseId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      instructorName: instructorName || null,
      meetingLink: meetingLink || null,
      schedule: schedule || null,
      description: description || null,
    },
  });

  revalidatePath("/admin/batches");
  revalidatePath("/admin");
}

async function updateBatch(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const courseId = String(formData.get("courseId") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const instructorName = String(formData.get("instructorName") || "").trim();
  const meetingLink = String(formData.get("meetingLink") || "").trim();
  const schedule = String(formData.get("schedule") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const isActive = String(formData.get("isActive") || "false") === "true";
  const isArchived = String(formData.get("isArchived") || "false") === "true";

  if (!id || !name || !courseId) return;

  await prisma.batch.update({
    where: { id },
    data: {
      name,
      courseId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      instructorName: instructorName || null,
      meetingLink: meetingLink || null,
      schedule: schedule || null,
      description: description || null,
      isActive,
      isArchived,
    },
  });

  revalidatePath("/admin/batches");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

async function deleteBatch(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const id = String(formData.get("id") || "");

  if (!id) return;

  await prisma.batch.delete({ where: { id } });
  revalidatePath("/admin/batches");
  revalidatePath("/admin");
}

async function assignStudents(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const batchId = String(formData.get("batchId") || "");
  const userIds = formData.getAll("userIds").map((value) => String(value)).filter(Boolean);

  if (!batchId || userIds.length === 0) return;

  const batch = await prisma.batch.findUnique({ where: { id: batchId }, select: { courseId: true } });
  if (!batch) return;

  await prisma.$transaction(
    userIds.flatMap((userId) => [
      prisma.batchStudent.upsert({
        where: { batchId_userId: { batchId, userId } },
        update: {},
        create: { batchId, userId },
      }),
      prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId, courseId: batch.courseId } },
        update: { status: "ENROLLED" },
        create: { userId, courseId: batch.courseId, status: "ENROLLED" },
      }),
    ])
  );

  revalidatePath("/admin/batches");
  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
}

async function removeStudent(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const batchId = String(formData.get("batchId") || "");
  const userId = String(formData.get("userId") || "");

  if (!batchId || !userId) return;

  await prisma.batchStudent.deleteMany({ where: { batchId, userId } });
  revalidatePath("/admin/batches");
  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
}

async function transferStudent(formData: FormData) {
  "use server";

  await requireAdmin("/admin/batches");
  const fromBatchId = String(formData.get("fromBatchId") || "");
  const toBatchId = String(formData.get("toBatchId") || "");
  const userId = String(formData.get("userId") || "");

  if (!fromBatchId || !toBatchId || !userId || fromBatchId === toBatchId) return;

  const toBatch = await prisma.batch.findUnique({ where: { id: toBatchId }, select: { courseId: true } });
  if (!toBatch) return;

  await prisma.$transaction([
    prisma.batchStudent.deleteMany({ where: { batchId: fromBatchId, userId } }),
    prisma.batchStudent.upsert({
      where: { batchId_userId: { batchId: toBatchId, userId } },
      update: {},
      create: { batchId: toBatchId, userId },
    }),
    prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId: toBatch.courseId } },
      update: { status: "ENROLLED" },
      create: { userId, courseId: toBatch.courseId, status: "ENROLLED" },
    }),
  ]);

  revalidatePath("/admin/batches");
  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
}

function inputClass() {
  return "h-12 w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

function textareaClass() {
  return "w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-100/36 focus:border-[#67d8ff]";
}

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function AdminBatchesPage() {
  const [courses, students, batches] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
    prisma.batch.findMany({
      orderBy: [{ isArchived: "asc" }, { createdAt: "desc" }],
      include: {
        course: { select: { title: true } },
        students: {
          orderBy: { assignedAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, isActive: true } },
          },
        },
      },
    }),
  ]);

  const activeBatchCount = batches.filter((batch) => batch.isActive && !batch.isArchived).length;
  const assignedStudentCount = new Set(batches.flatMap((batch) => batch.students.map((student) => student.userId))).size;

  return (
    <div className="space-y-10">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">Create and Manage Batches</p>
        <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Batches</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
              Create cohorts, assign courses, add or transfer students, and maintain class schedules and meeting links.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-2xl font-extrabold text-white">{activeBatchCount}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100/48">active</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-2xl font-extrabold text-white">{assignedStudentCount}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100/48">students</p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/35 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/10 text-[#67d8ff]">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Create new batch</h2>
            <p className="text-sm text-blue-100/55">Set course, timeline, instructor, and class details.</p>
          </div>
        </div>
        <form action={createBatch} className="grid gap-4 lg:grid-cols-2">
          <input name="name" required placeholder="Batch name, e.g. Java DSA Weekend Batch" className={inputClass()} />
          <select name="courseId" required className={inputClass()} defaultValue={courses[0]?.id || ""}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input name="startDate" type="date" className={inputClass()} />
          <input name="endDate" type="date" className={inputClass()} />
          <input name="instructorName" placeholder="Instructor name" className={inputClass()} />
          <input name="meetingLink" type="url" placeholder="Class meeting link" className={inputClass()} />
          <input name="schedule" placeholder="Schedule, e.g. Sat-Sun · 11:00 AM IST" className={inputClass()} />
          <textarea name="description" rows={3} placeholder="Batch description" className={`${textareaClass()} lg:row-span-2`} />
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff1683] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e61477] lg:col-span-2">
            <Workflow className="h-4 w-4" />
            Create batch
          </button>
        </form>
      </section>

      <section className="grid gap-7">
        {batches.length ? (
          batches.map((batch) => (
            <article key={batch.id} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                      batch.isActive && !batch.isArchived ? "bg-emerald-400/10 text-emerald-200" : "bg-white/8 text-blue-100/58"
                    }`}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {batch.isArchived ? "Archived" : batch.isActive ? "Active" : "Inactive"}
                    </span>
                    {batch.instructorName && (
                      <span className="rounded-full bg-[#67d8ff]/10 px-3 py-1 text-xs font-bold text-[#67d8ff]">
                        {batch.instructorName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">{batch.name}</h2>
                  <p className="mt-2 text-blue-100/58">{batch.course.title} · {batch.schedule || "Schedule pending"}</p>
                  {batch.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/52">{batch.description}</p>}
                </div>
                <form action={deleteBatch}>
                  <input type="hidden" name="id" value={batch.id} />
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 text-sm font-bold text-red-100 transition hover:bg-red-500/20">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </form>
              </div>

              <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
                <form action={updateBatch} className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="id" value={batch.id} />
                  <input name="name" required defaultValue={batch.name} className={inputClass()} />
                  <select name="courseId" required defaultValue={batch.courseId} className={inputClass()}>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <input name="startDate" type="date" defaultValue={dateInputValue(batch.startDate)} className={inputClass()} />
                  <input name="endDate" type="date" defaultValue={dateInputValue(batch.endDate)} className={inputClass()} />
                  <input name="instructorName" defaultValue={batch.instructorName || ""} placeholder="Instructor" className={inputClass()} />
                  <input name="meetingLink" type="url" defaultValue={batch.meetingLink || ""} placeholder="Meeting link" className={inputClass()} />
                  <input name="schedule" defaultValue={batch.schedule || ""} placeholder="Schedule" className={inputClass()} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select name="isActive" defaultValue={String(batch.isActive)} className={inputClass()}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <select name="isArchived" defaultValue={String(batch.isArchived)} className={inputClass()}>
                      <option value="false">Visible</option>
                      <option value="true">Archived</option>
                    </select>
                  </div>
                  <textarea name="description" rows={3} defaultValue={batch.description || ""} placeholder="Description" className={`${textareaClass()} md:col-span-2`} />
                  <button className="h-12 rounded-2xl border border-[#67d8ff]/35 bg-[#67d8ff]/10 px-5 text-sm font-bold text-[#67d8ff] transition hover:bg-[#67d8ff] hover:text-[#020817] md:col-span-2">
                    <Archive className="mr-2 inline h-4 w-4" />
                    Save batch changes
                  </button>
                </form>

                <div className="rounded-3xl border border-white/10 bg-[#020817]/45 p-5">
                  <h3 className="text-lg font-extrabold text-white">Students</h3>
                  <p className="mt-1 text-sm text-blue-100/52">{batch.students.length} assigned</p>
                  <form action={assignStudents} className="mt-4 grid gap-3">
                    <input type="hidden" name="batchId" value={batch.id} />
                    <select name="userIds" multiple required size={Math.min(Math.max(students.length, 3), 7)} className="w-full rounded-2xl border border-white/12 bg-blue-950/70 px-4 py-3 text-sm text-white outline-none focus:border-[#67d8ff]">
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name || student.email}
                        </option>
                      ))}
                    </select>
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]">
                      <UserPlus className="h-4 w-4" />
                      Add selected students
                    </button>
                  </form>
                  <div className="mt-5 grid gap-3">
                    {batch.students.map((membership) => (
                      <div key={membership.id} className="rounded-2xl bg-white/[0.045] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{membership.user.name || "Student"}</p>
                            <p className="text-sm text-blue-100/50">{membership.user.email}</p>
                          </div>
                          <form action={removeStudent}>
                            <input type="hidden" name="batchId" value={batch.id} />
                            <input type="hidden" name="userId" value={membership.userId} />
                            <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 px-3 text-xs font-bold text-red-100 hover:bg-red-500/20">
                              <UserMinus className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </form>
                        </div>
                        <form action={transferStudent} className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input type="hidden" name="fromBatchId" value={batch.id} />
                          <input type="hidden" name="userId" value={membership.userId} />
                          <select name="toBatchId" defaultValue="" className={`${inputClass()} h-10 text-xs`}>
                            <option value="" disabled>Transfer to batch</option>
                            {batches.filter((targetBatch) => targetBatch.id !== batch.id).map((targetBatch) => (
                              <option key={targetBatch.id} value={targetBatch.id}>
                                {targetBatch.name}
                              </option>
                            ))}
                          </select>
                          <button className="h-10 rounded-xl border border-white/12 px-3 text-xs font-bold text-blue-100 transition hover:border-[#67d8ff]/40 hover:text-[#67d8ff]">
                            Transfer
                          </button>
                        </form>
                      </div>
                    ))}
                    {batch.students.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-blue-100/50">No students assigned yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/12 p-10 text-center text-blue-100/58">
            No batches yet.
          </div>
        )}
      </section>
    </div>
  );
}
