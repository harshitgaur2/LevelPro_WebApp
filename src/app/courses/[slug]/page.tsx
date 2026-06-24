import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  FileText,
  GitBranch,
  GraduationCap,
  Layers3,
  LineChart,
  SearchCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { courses, getCourse, type Course, type CourseIcon } from "@/lib/course-data";

const courseIcons: Record<CourseIcon, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  file: FileText,
  layers: Layers3,
  users: Users,
  git: GitBranch,
  chart: LineChart,
  science: SearchCheck,
  ai: BrainCircuit,
};

const metricIcons = [CalendarDays, GraduationCap, Code2, Award];
const javaEnrollmentFormUrl = "https://forms.gle/tbu4NmGjJBeJsXrHA";

type CoursePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);

  if (!course) {
    return {
      title: "Course not found | LevelPro",
    };
  }

  return {
    title: `${course.title} | LevelPro`,
    description: course.description,
  };
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h2 className="text-3xl font-extrabold tracking-normal text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-blue-100/68">{text}</p>
    </div>
  );
}

function CourseVisual({ course }: { course: Course }) {
  const Icon = courseIcons[course.icon];

  return (
    <div className="relative animate-fade-in">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(103,216,255,0.22),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(255,22,131,0.2),transparent_35%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#061538]/84 shadow-[0_32px_110px_rgba(0,28,128,0.34)] backdrop-blur-xl">
        <div className="code-grid absolute inset-0 opacity-30" />
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${course.accent}`} />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">LevelPro course</p>
              <h3 className="mt-2 text-2xl font-extrabold text-white">{course.title}</h3>
            </div>
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${course.accent} p-[1px]`}>
              <div className="grid h-full w-full place-items-center rounded-3xl bg-[#061538] text-white">
                <Icon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-[#020817]/78 p-5 font-mono text-sm leading-7 text-blue-50/82">
            <p className="text-[#67d8ff]">{"// course roadmap"}</p>
            <p>const level = &quot;{course.level}&quot;;</p>
            <p>const duration = &quot;{course.duration}&quot;;</p>
            <p>const project = &quot;{course.finalProject.title}&quot;;</p>
            <p className="mt-4 text-[#ff7cbd]">startLearning(course);</p>
          </div>

          <div className="mt-6 grid gap-3">
            {course.curriculum.slice(0, 4).map((module, index) => (
              <div
                key={module.title}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#67d8ff]/10 text-sm font-extrabold text-[#67d8ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-white">{module.title}</span>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificatePreview({ course }: { course: Course }) {
  return (
    <div className="rounded-[2rem] border border-white/12 bg-white/[0.045] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#67d8ff]/25 bg-[#061538] p-7 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(103,216,255,0.18),transparent_32%),radial-gradient(circle_at_88%_90%,rgba(255,22,131,0.16),transparent_34%)]" />
        <div className="relative">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#ff1683] text-white shadow-[0_18px_45px_rgba(255,22,131,0.28)]">
            <Trophy className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#67d8ff]">Certificate of completion</p>
          <h3 className="mt-3 text-2xl font-extrabold text-white">{course.title}</h3>
          <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-5">
            <p className="text-sm text-blue-100/55">Awarded to</p>
            <p className="mt-1 text-2xl font-bold text-white">Student Name</p>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 text-left text-sm text-blue-100/62">
            <div>
              <p className="text-blue-100/42">Instructor</p>
              <p className="mt-1 font-semibold text-white">LevelPro Faculty</p>
            </div>
            <div>
              <p className="text-blue-100/42">Certificate ID</p>
              <p className="mt-1 font-semibold text-white">LP-COURSE-2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);

  if (!course) {
    notFound();
  }

  const Icon = courseIcons[course.icon];
  const enrollHref = course.slug === "dsa-java" ? javaEnrollmentFormUrl : "/signup";
  const enrollTarget = course.slug === "dsa-java" ? "_blank" : undefined;
  const metrics = [
    ["Duration", course.duration],
    ["Level", course.level],
    ["Project", course.projects],
    ["Certificate", "Included"],
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      <main className="overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.23),transparent_30%),linear-gradient(180deg,#020817_0%,#03102d_48%,#020817_100%)]">
        <section className="relative">
          <div className="code-grid absolute inset-0 opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(37,99,235,0.2),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(255,1,131,0.14),transparent_30%),linear-gradient(180deg,rgba(2,8,23,0)_72%,#03102d_100%)]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8 lg:py-28">
            <div className="animate-slide-up">
              <Link
                href="/#courses"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100/62 transition hover:text-[#67d8ff]"
              >
                Courses <ChevronRight className="h-4 w-4" /> {course.category}
              </Link>

              <div className={`mt-7 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br ${course.accent} p-[1px]`}>
                <div className="grid h-full w-full place-items-center rounded-3xl bg-[#061538] text-white">
                  <Icon className="h-8 w-8" />
                </div>
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-normal text-white sm:text-6xl lg:text-7xl">
                {course.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-blue-100/72 sm:text-xl sm:leading-9">
                {course.overview}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href={enrollHref} target={enrollTarget} rel={enrollTarget ? "noreferrer" : undefined}>
                  <Button
                    variant="accent"
                    size="lg"
                    className="h-14 w-full rounded-2xl bg-[#ff1683] px-8 text-base font-bold shadow-[0_18px_45px_rgba(255,22,131,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e61477] sm:w-auto"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Enroll Now
                  </Button>
                </Link>
                <a
                  href="#curriculum"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.035] px-8 text-base font-bold text-blue-100/80 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-5 w-5" />
                  Download Curriculum
                </a>
              </div>
            </div>

            <CourseVisual course={course} />
          </div>
        </section>

        <section className="relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map(([label, value], index) => {
                const MetricIcon = metricIcons[index];
                return (
                  <div
                    key={label}
                    className="animate-slide-up rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/35 hover:bg-white/[0.065]"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <MetricIcon className="h-7 w-7 text-[#67d8ff]" />
                    <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-blue-100/48">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative py-24 sm:py-28 lg:py-32">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionIntro
              title="What you will learn"
              text="A clear learning path with practical modules, guided practice, tools, and a portfolio-ready final project."
            />

            <div id="curriculum" className="mt-14 grid gap-5 lg:grid-cols-2">
              {course.curriculum.map((module, index) => (
                <article
                  key={module.title}
                  className="group animate-slide-up rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/35 hover:bg-white/[0.065] sm:p-7"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div className="flex gap-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#67d8ff]/10 text-sm font-extrabold text-[#67d8ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{module.title}</h3>
                      <p className="mt-3 text-base leading-7 text-blue-100/64">{module.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-3xl font-extrabold tracking-normal text-white sm:text-4xl lg:text-5xl">
                Outcomes that make your learning visible.
              </h2>
              <p className="mt-5 text-lg leading-8 text-blue-100/68">
                Each course is designed around practical evidence: projects, practice, tools, and a certificate students can use in their profile.
              </p>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff7cbd]">Final project</p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">{course.finalProject.title}</h3>
                <p className="mt-4 text-base leading-7 text-blue-100/66">{course.finalProject.description}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {course.outcomes.map((outcome, index) => (
                <div
                  key={outcome}
                  className="animate-slide-up rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/35 hover:bg-white/[0.065]"
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                  <p className="mt-4 text-lg font-semibold leading-7 text-white">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 sm:py-28 lg:py-32">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-xl sm:p-10">
                <Target className="h-8 w-8 text-[#67d8ff]" />
                <h2 className="mt-6 text-3xl font-extrabold tracking-normal text-white sm:text-4xl">
                  Who this course is for
                </h2>
                <div className="mt-8 grid gap-4">
                  {course.audience.map((item) => (
                    <div key={item} className="flex gap-3 text-base leading-7 text-blue-100/72">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#67d8ff]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-xl sm:p-10">
                <Sparkles className="h-8 w-8 text-[#ff7cbd]" />
                <h2 className="mt-6 text-3xl font-extrabold tracking-normal text-white sm:text-4xl">
                  Tools and skills covered
                </h2>
                <div className="mt-8 flex flex-wrap gap-3">
                  {course.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-blue-100/78"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-normal text-white sm:text-4xl lg:text-5xl">
                Earn a LevelPro certificate after completing the course.
              </h2>
              <p className="mt-5 text-lg leading-8 text-blue-100/68">
                The certificate preview is generated inside the platform and can be used to show course completion, project work, and learning milestones.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href={enrollHref} target={enrollTarget} rel={enrollTarget ? "noreferrer" : undefined}>
                  <Button
                    variant="accent"
                    size="lg"
                    className="h-14 rounded-2xl bg-[#ff1683] px-8 text-base font-bold shadow-[0_18px_45px_rgba(255,22,131,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e61477]"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Enroll Now
                  </Button>
                </Link>
                <a
                  href="#curriculum"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.055] px-8 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <BookOpenCheck className="h-5 w-5" />
                  View Curriculum
                </a>
              </div>
            </div>

            <CertificatePreview course={course} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
