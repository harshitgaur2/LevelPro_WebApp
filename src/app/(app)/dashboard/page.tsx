"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Circle,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  Settings,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  CourseEnrollment,
  CourseModule,
  LearningBatch,
  LearningProfile,
  PracticeQuestion,
  fetchLearning,
  markNotificationRead,
  updateQuestionProgress,
} from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

const sectionStyles: Record<string, string> = {
  Basics: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  Recursion: "border-violet-300/20 bg-violet-400/10 text-violet-100",
  "Basic DS": "border-blue-300/20 bg-blue-400/10 text-blue-100",
  "Advance DS": "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
};

function moduleCompleted(module: CourseModule) {
  if (module.questions.length > 0) {
    return module.questions.every(questionCompleted);
  }

  return module.progress.some((progress) => progress.completed);
}

function questionCompleted(question: PracticeQuestion) {
  return question.progress.some((progress) => progress.completed);
}

function courseStats(enrollment: CourseEnrollment) {
  const modules = enrollment.course.modules;
  const totalQuestions = modules.reduce((total, module) => total + module.questions.length, 0);
  const completedQuestions = modules.reduce(
    (total, module) => total + module.questions.filter(questionCompleted).length,
    0
  );
  const completedModules = modules.filter(moduleCompleted).length;
  const progressValue = totalQuestions
    ? Math.round((completedQuestions / totalQuestions) * 100)
    : modules.length
      ? Math.round((completedModules / modules.length) * 100)
      : 0;

  return { totalQuestions, completedQuestions, completedModules, progressValue };
}

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function groupModules(modules: CourseModule[]) {
  return modules.reduce<Record<string, CourseModule[]>>((groups, courseModule) => {
    groups[courseModule.section] ||= [];
    groups[courseModule.section].push(courseModule);
    return groups;
  }, {});
}

function formatDate(value: string | null) {
  if (!value) {
    return "Now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#ff1683 ${value * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
      }}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#061538] text-center">
        <span className="text-2xl font-extrabold text-white">{value}%</span>
        <span className="-mt-2 text-[10px] font-semibold uppercase text-blue-100/55">done</span>
      </div>
    </div>
  );
}

function profileCompletion(profile: LearningProfile | null) {
  const fields = [
    profile?.phone,
    profile?.college,
    profile?.courseEnrolled,
    profile?.resumeUrl,
    profile?.linkedinUrl,
    profile?.githubUrl,
    profile?.bio,
    profile?.skills,
    profile?.education,
  ];
  const completed = fields.filter(Boolean).length;

  return {
    completed,
    total: fields.length,
    percent: Math.round((completed / fields.length) * 100),
  };
}

function CurrentBatchCard({ batch }: { batch: LearningBatch | undefined }) {
  if (!batch) {
    return (
      <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-4">
        <p className="font-bold text-white">No active batch assigned</p>
        <p className="mt-1 text-sm leading-5 text-blue-100/55">Your batch, class schedule, and meeting link will appear after admin assignment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#67d8ff]/18 bg-[#67d8ff]/8 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#67d8ff]">Current batch</p>
      <h3 className="mt-2 font-extrabold text-white">{batch.name}</h3>
      <p className="mt-1 text-sm text-blue-100/62">{batch.course.title}</p>
      <div className="mt-3 space-y-2 text-sm text-blue-100/62">
        <p>{batch.instructorName || "Instructor to be announced"}</p>
        <p>{batch.schedule || "Schedule pending"}</p>
      </div>
      {batch.meetingLink && (
        <a
          href={batch.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ff1683]/14 px-3 py-2 text-xs font-bold text-pink-100 transition hover:bg-[#ff1683] hover:text-white"
        >
          <Link2 className="h-3.5 w-3.5" />
          Open class link
        </a>
      )}
    </div>
  );
}

function CourseOverview({ enrollment }: { enrollment: CourseEnrollment }) {
  const modules = enrollment.course.modules;
  const { completedQuestions, completedModules, progressValue, totalQuestions } = courseStats(enrollment);
  const lectureCount = modules.reduce((total, module) => total + module.lectureCount, 0);

  return (
    <section className="animate-slide-up rounded-[2rem] border border-blue-300/15 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/40 sm:p-8 lg:p-9">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase text-cyan-100">
            <GraduationCap className="h-3.5 w-3.5" />
            {enrollment.status}
          </div>
          <h2 className="text-2xl font-extrabold tracking-normal text-white sm:text-3xl">
            {enrollment.course.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/68 sm:text-base">
            {enrollment.course.description}
          </p>
        </div>
        <ProgressRing value={progressValue} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Modules", value: modules.length, icon: BookOpen },
          { label: "Lectures", value: lectureCount, icon: CalendarClock },
          { label: "Questions Done", value: `${completedQuestions}/${totalQuestions}`, icon: CheckCircle2 },
          { label: "Modules Done", value: `${completedModules}/${modules.length}`, icon: Trophy },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/35 hover:bg-white/[0.065]">
            <Icon className="mb-3 h-5 w-5 text-[#67d8ff]" />
            <p className="text-2xl font-extrabold text-white">{value}</p>
            <p className="text-sm text-blue-100/55">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModuleList({ enrollment }: { enrollment: CourseEnrollment }) {
  const queryClient = useQueryClient();
  const groupedModules = useMemo(() => groupModules(enrollment.course.modules), [enrollment.course.modules]);

  const progressMutation = useMutation({
    mutationFn: updateQuestionProgress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning"] }),
  });

  return (
    <div className="space-y-8">
      {Object.entries(groupedModules).map(([section, modules]) => (
        <section key={section} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white">{section}</h3>
              <p className="text-sm text-blue-100/55">
                {modules.reduce((total, module) => total + module.lectureCount, 0)} lectures
              </p>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-bold ${sectionStyles[section] || "border-blue-300/20 bg-blue-400/10 text-blue-100"}`}>
              {modules.filter(moduleCompleted).length}/{modules.length} complete
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {modules.map((courseModule) => {
              const completed = moduleCompleted(courseModule);
              const completedQuestions = courseModule.questions.filter(questionCompleted).length;
              return (
                <article
                  key={courseModule.id}
                  className="flex min-h-[31rem] flex-col rounded-3xl border border-blue-300/14 bg-[#081a43]/88 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#0a1f50] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-blue-100/45">
                        Module {courseModule.orderIndex} • {courseModule.lectureCount} lecture{courseModule.lectureCount > 1 ? "s" : ""}
                      </p>
                      <h4 className="mt-2 text-lg font-extrabold leading-tight text-white">{courseModule.title}</h4>
                    </div>
                    <span className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold ${
                      completed ? "bg-emerald-400/15 text-emerald-200" : "border border-white/12 bg-white/5 text-blue-100/70"
                    }`}>
                      {completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {completed ? "Complete" : `${completedQuestions}/${courseModule.questions.length}`}
                    </span>
                  </div>

                  <div className="mt-5 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd] transition-all duration-500"
                      style={{
                        width: `${courseModule.questions.length ? Math.round((completedQuestions / courseModule.questions.length) * 100) : 0}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 grid flex-1 grid-cols-1 content-start gap-2.5">
                    {courseModule.questions.map((question) => (
                      <div
                        key={question.id}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-blue-50/82 transition hover:border-[#67d8ff]/45 hover:bg-[#67d8ff]/10 hover:text-white"
                      >
                        <button
                          type="button"
                          onClick={() => progressMutation.mutate({ questionId: question.id, completed: !questionCompleted(question) })}
                          disabled={progressMutation.isPending}
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition ${
                            questionCompleted(question)
                              ? "border-emerald-300/35 bg-emerald-400/15 text-emerald-200"
                              : "border-white/12 bg-white/5 text-blue-100/65 hover:border-[#67d8ff]/45 hover:text-[#67d8ff]"
                          }`}
                          aria-label={`Mark ${question.title} ${questionCompleted(question) ? "incomplete" : "complete"}`}
                        >
                          {questionCompleted(question) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </button>
                        <a
                          href={question.leetcodeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 flex-1 truncate transition hover:text-[#67d8ff]"
                        >
                          {question.orderIndex}. {question.title}
                        </a>
                        <span className="inline-flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-blue-100/70">
                            {question.difficulty}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["learning"],
    queryFn: fetchLearning,
  });

  const activeEnrollment = data?.data.enrollments[0];
  const activeStats = activeEnrollment ? courseStats(activeEnrollment) : null;
  const studentName = session?.user?.name || "Student";
  const activeBatch = data?.data.batches[0];
  const profileStats = profileCompletion(data?.data.profile || null);
  const upcomingClasses = data?.data.notifications.filter((notification) =>
    ["LIVE_CLASS", "CLASS_REMINDER", "CLASS_UPDATE"].includes(notification.type)
  ).slice(0, 3);

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning"] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020817] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="code-grid fixed inset-0 opacity-35" />
      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff1683]/25 bg-[#ff1683]/10 px-3 py-1 text-sm font-bold text-pink-100">
              <Sparkles className="h-4 w-4" />
              LevelPro Learning
            </div>
            <h1 className="text-3xl font-extrabold tracking-normal sm:text-5xl">
              {greeting()}, {studentName}
            </h1>
            <p className="mt-3 max-w-2xl text-blue-100/65">
              Track your modules, class updates, resume readiness, and LeetCode practice from one responsive learning dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/profile">
              <Button
                variant="secondary"
                className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                leftIcon={<Settings className="h-4 w-4" />}
              >
                Complete Profile
              </Button>
            </Link>
            <a href="#modules">
              <Button
                variant="accent"
                className="w-full bg-[#ff1683] hover:bg-[#e61477] sm:w-auto"
                rightIcon={<ArrowUpRight className="h-4 w-4" />}
              >
                Continue Learning
              </Button>
            </a>
          </div>
        </header>

        <div className="mb-12 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          {activeEnrollment ? (
            <CourseOverview enrollment={activeEnrollment} />
          ) : (
            <section className="rounded-[2rem] border border-blue-300/15 bg-[#061538]/90 p-7">
              <h2 className="text-2xl font-extrabold text-white">No course enrollment yet</h2>
              <p className="mt-2 text-blue-100/65">Ask the admin to enroll you into Java DSA, GitHub, or Data Science.</p>
            </section>
          )}

          <aside className="animate-slide-up rounded-[2rem] border border-blue-300/15 bg-[#061538]/90 p-6 shadow-2xl shadow-blue-950/40 sm:p-7">
            <div className="mb-5 flex items-center gap-4">
              <Avatar src={session?.user?.image} name={session?.user?.name} size="xl" className="h-16 w-16 border border-white/15" />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold text-white">{session?.user?.name || "Student"}</h2>
                <p className="truncate text-sm text-blue-100/58">{session?.user?.email}</p>
              </div>
            </div>
            <Link href="/profile" className="mb-5 block">
              <Button variant="outline" className="w-full border-[#67d8ff] text-[#67d8ff] hover:bg-[#67d8ff] hover:text-[#020817]">
                Update resume & profile
              </Button>
            </Link>

            <div className="mb-5 grid gap-4">
              <CurrentBatchCard batch={activeBatch} />
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">Profile completion</p>
                  <span className="font-extrabold text-[#67d8ff]">{profileStats.percent}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd]"
                    style={{ width: `${profileStats.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-blue-100/48">
                  {profileStats.completed}/{profileStats.total} fields completed
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <p className="font-bold text-white">Resume</p>
                {data?.data.profile?.resumeUrl ? (
                  <a href={data.data.profile.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#67d8ff] hover:text-white">
                    <FileText className="h-4 w-4" />
                    View uploaded resume
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-blue-100/55">Upload your resume from profile settings.</p>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#67d8ff]" />
                <h3 className="font-extrabold text-white">Class Notifications</h3>
                </div>
                <span className="rounded-full bg-[#ff1683]/12 px-2.5 py-1 text-xs font-bold text-pink-100">
                  {data?.data.unreadCount || 0} unread
                </span>
              </div>
              {!!upcomingClasses?.length && (
                <div className="mb-4 rounded-2xl border border-[#67d8ff]/15 bg-[#67d8ff]/8 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#67d8ff]">Upcoming classes</p>
                  <div className="mt-3 space-y-3">
                    {upcomingClasses.map((notification) => (
                      <div key={notification.id} className="text-sm">
                        <p className="font-bold text-white">{notification.title}</p>
                        <p className="text-blue-100/52">{formatDate(notification.scheduledAt || notification.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {data?.data.notifications.length ? (
                  data.data.notifications.map((notification) => (
                    <div key={notification.id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#67d8ff]/35 hover:bg-white/[0.055]">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#67d8ff]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#67d8ff]">
                          {notification.type.replaceAll("_", " ")}
                        </span>
                        <span className={`text-xs font-semibold ${notification.read ? "text-blue-100/42" : "text-pink-100"}`}>
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </div>
                      <p className="mb-2 text-xs font-semibold text-blue-100/42">
                        {notification.batch?.name || notification.course?.title || notification.targetUser?.name || "All students"}
                      </p>
                      <p className="font-bold text-white">{notification.title}</p>
                      <p className="mt-1 text-sm leading-5 text-blue-100/62">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notification.classLink && (
                          <a href={notification.classLink} target="_blank" rel="noreferrer" className="rounded-xl bg-[#ff1683]/12 px-3 py-1.5 text-xs font-bold text-pink-100 transition hover:bg-[#ff1683] hover:text-white">
                            Live class
                          </a>
                        )}
                        {notification.pdfUrl && (
                          <a href={notification.pdfUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/8 px-3 py-1.5 text-xs font-bold text-blue-100 transition hover:bg-white/15">
                            PDF
                          </a>
                        )}
                        {notification.resourceUrl && (
                          <a href={notification.resourceUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/8 px-3 py-1.5 text-xs font-bold text-blue-100 transition hover:bg-white/15">
                            Resource
                          </a>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#67d8ff]">{formatDate(notification.scheduledAt || notification.createdAt)}</p>
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => readMutation.mutate(notification.id)}
                            disabled={readMutation.isPending}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-100 transition hover:border-[#67d8ff]/40 hover:text-[#67d8ff]"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-blue-100/58">
                    No class notifications yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section id="modules" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#67d8ff]">
                <Code2 className="h-5 w-5" />
                <span className="text-sm font-bold uppercase">Modules & Practice</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Java DSA roadmap</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-blue-100/65">
              <FileText className="h-4 w-4" />
              {activeStats
                ? `${activeStats.completedQuestions}/${activeStats.totalQuestions} questions complete • ${activeStats.completedModules}/${activeEnrollment?.course.modules.length || 0} modules`
                : "10 LeetCode questions per module"}
            </div>
          </div>

          {activeEnrollment && <ModuleList enrollment={activeEnrollment} />}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
