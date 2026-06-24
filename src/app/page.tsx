import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  FileText,
  GitBranch,
  Layers3,
  LineChart,
  Link2,
  Play,
  SearchCheck,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { courses, type Course, type CourseIcon } from "@/lib/course-data";

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

const instructors = [
  {
    name: "Harshit Gaur",
    role: "Founder & Lead Instructor",
    image: "/harshit-gaur.jpg",
    focus: "Analytics engineering, AI workflows, system thinking, and career-ready coding mentorship.",
    bio:
      "Harshit brings 3+ years of enterprise data analytics and engineering experience across Monotype, Cheil Worldwide, and Publicis Sapient. He has led Adobe Analytics, Customer Journey Analytics, AEP, ETL, experimentation, dashboards, and RCA programs for global product and marketing teams.",
    highlights: [
      "Data Analytics Engineer with 3+ years of experience",
      "Adobe Analytics Architect, Adobe Target, RTCDP, Power BI, Azure and Databricks certified",
      "Built ETL pipelines, dashboards, A/B testing frameworks, and AI/GenAI use cases",
      "Published research across deep learning, medical imaging, and deepfake detection",
    ],
    tags: ["Python", "JavaScript", "C++", "SQL", "DSA", "GenAI", "Power BI", "Adobe Analytics"],
    metrics: [
      ["3+", "Years experience"],
      ["8", "Certifications"],
      ["3", "Research papers"],
      ["$250K+", "Cost savings"],
    ],
    links: [
      { label: "LinkedIn", href: "https://linkedin.com/in/harshitgaur2", icon: Link2 },
      { label: "GitHub", href: "https://github.com/harshitgaur2", icon: Code2 },
    ],
  },
  {
    name: "Rahul Gupta",
    role: "DSA & Java Coding Instructor",
    image: "/rahul-gupta.jpg",
    focus: "Java DSA, problem solving, automation testing habits, and interview-oriented coding practice.",
    bio:
      "Rahul trains students in Data Structures, Algorithms, and coding in Java with a practical engineer's lens. His background spans consulting, QA engineering, automation and manual testing, and Agile delivery.",
    highlights: [
      "Consultant at Snap-on Business Solutions",
      "QA Engineer with 5 years of experience",
      "Hands-on with Selenium, Java, Cucumber, Jira, Agile, and BDD",
      "Focused on DSA foundations, coding discipline, and test-driven problem solving",
    ],
    tags: ["Java", "DSA", "Selenium", "Cucumber", "Jira", "Agile", "BDD", "QA"],
    metrics: [
      ["5", "Years experience"],
      ["Java", "Core language"],
      ["DSA", "Training focus"],
      ["QA", "Testing expertise"],
    ],
    links: [],
  },
];

const heroStats = [
  ["25+", "Courses"],
  ["18K+", "Students"],
  ["300+", "Learning hours"],
  ["4.8/5", "Student rating"],
];

const learningFlow = [
  {
    title: "Learn with structure",
    text: "Follow a clear course path instead of scattered tutorials.",
  },
  {
    title: "Practice every module",
    text: "Each topic connects to curated LeetCode problem sets.",
  },
  {
    title: "Track your progress",
    text: "Students can see completed modules and class updates.",
  },
];

function SectionIntro({
  title,
  text,
  align = "center",
}: {
  title: string;
  text: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto flex max-w-4xl flex-col items-center text-center" : "max-w-3xl"}>
      <h2 className="text-4xl font-extrabold tracking-normal text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100/68">{text}</p>
    </div>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = courseIcons[course.icon];

  return (
    <article
      className="group flex min-h-[23rem] animate-slide-up flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#67d8ff]/45 hover:bg-white/[0.065] hover:shadow-[0_28px_90px_rgba(37,99,235,0.22)] lg:p-9"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div>
        <div className={`mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${course.accent} p-[1px]`}>
          <div className="grid h-full w-full place-items-center rounded-2xl bg-[#061538] text-white">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#67d8ff]/80">
          {course.category}
        </p>
        <h3 className="mt-3 text-2xl font-bold text-white">{course.title}</h3>
        <p className="mt-4 text-base leading-7 text-blue-100/66">{course.description}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[course.level, course.duration, course.projects].map((detail) => (
            <span
              key={detail}
              className="rounded-xl bg-white/[0.055] px-3 py-2 text-xs font-semibold text-blue-100/66"
            >
              {detail}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-white transition group-hover:border-[#67d8ff]/40 group-hover:bg-[#67d8ff]/10 group-hover:text-[#67d8ff]"
        >
          View course <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function InstructorProfile({
  instructor,
  reverse = false,
}: {
  instructor: (typeof instructors)[number];
  reverse?: boolean;
}) {
  const icons = [BriefcaseBusiness, Award, LineChart, BrainCircuit, SearchCheck];

  return (
    <article className="grid animate-slide-up items-center gap-10 lg:grid-cols-2 lg:gap-12">
      <div className={`relative min-h-[28rem] overflow-hidden rounded-3xl shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:min-h-[34rem] lg:min-h-[40rem] ${reverse ? "lg:order-2" : ""}`}>
        <Image
          src={instructor.image}
          alt={`${instructor.name}, ${instructor.role}`}
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          className={instructor.name === "Harshit Gaur" ? "object-cover object-[52%_35%]" : "object-cover object-[50%_20%]"}
          priority={instructor.name === "Harshit Gaur"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/86 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">
            {instructor.role}
          </p>
          <h3 className="mt-2 text-3xl font-extrabold text-white">{instructor.name}</h3>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-10 lg:p-12">
        <p className="text-xl font-semibold leading-8 text-[#67d8ff]">{instructor.focus}</p>
        <p className="mt-5 text-lg leading-8 text-blue-100/68">{instructor.bio}</p>

        <div className="mt-9 grid grid-cols-2 gap-4">
          {instructor.metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/[0.045] p-4">
              <p className="text-2xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-sm leading-5 text-blue-100/55">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 space-y-4">
          {instructor.highlights.map((highlight, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={highlight} className="flex gap-3 text-base leading-7 text-blue-100/74">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#67d8ff]/10 text-[#67d8ff]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{highlight}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex flex-wrap gap-2.5">
          {instructor.tags.map((tag) => (
            <span key={tag} className="rounded-xl bg-white/[0.055] px-3 py-2 text-sm font-semibold text-blue-100/72">
              {tag}
            </span>
          ))}
        </div>

        {instructor.links.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {instructor.links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#67d8ff]/30 bg-[#67d8ff]/10 px-5 text-sm font-bold text-[#67d8ff] transition hover:-translate-y-0.5 hover:bg-[#67d8ff] hover:text-[#020817]"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      <main className="overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.23),transparent_30%),linear-gradient(180deg,#020817_0%,#03102d_47%,#020817_100%)]">
        <section className="relative">
          <div className="code-grid absolute inset-0 opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(255,1,131,0.15),transparent_30%),linear-gradient(180deg,rgba(2,8,23,0)_72%,#03102d_100%)]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl animate-slide-up text-center lg:mx-0 lg:text-left">
              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Code Today. Build{" "}
                <span className="bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd] bg-clip-text text-transparent">
                  Tomorrow.
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-blue-100/72 sm:text-xl sm:leading-9 lg:mx-0">
                Learn coding through hands-on courses, real projects, guided practice,
                and career-ready systems built for students.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/signup">
                  <Button
                    variant="accent"
                    size="lg"
                    className="h-14 w-full rounded-2xl bg-[#ff1683] px-8 text-base font-bold shadow-[0_18px_45px_rgba(255,22,131,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e61477] sm:w-auto"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start Learning Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-14 w-full rounded-2xl border-white/15 bg-white/[0.055] px-8 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
                    rightIcon={<Code2 className="h-5 w-5" />}
                  >
                    Log in
                  </Button>
                </Link>
              </div>

              <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 lg:mx-0">
                {heroStats.map(([value, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-white">{value}</p>
                    <p className="mt-1 text-sm text-blue-100/55">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl animate-fade-in lg:mx-0 lg:max-w-none">
              <div className="absolute -left-4 top-10 hidden h-20 w-20 rounded-3xl border border-blue-300/20 bg-blue-500/10 p-5 text-blue-200 shadow-[0_0_40px_rgba(37,99,235,0.28)] backdrop-blur md:block animate-float">
                <Code2 className="h-full w-full" />
              </div>
              <div className="absolute -right-4 bottom-12 hidden h-20 w-20 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-5 text-pink-200 shadow-[0_0_44px_rgba(255,22,131,0.22)] backdrop-blur md:block animate-float" style={{ animationDelay: "1.2s" }}>
                <CheckCircle2 className="h-full w-full" />
              </div>

              <div className="rounded-[2rem] border border-blue-300/18 bg-[#061538]/84 text-left shadow-[0_32px_110px_rgba(0,28,128,0.34)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#67d8ff]/35">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex gap-5 text-sm text-blue-100/72">
                    <span className="border-b-2 border-[#2d7dff] pb-3 text-white">main.js</span>
                    <span>Output</span>
                    <span>Terminal</span>
                  </div>
                  <button className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff1683] text-white shadow-lg shadow-pink-500/30 transition hover:-translate-y-0.5 hover:bg-[#e61477]" aria-label="Run lesson">
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <pre className="overflow-hidden px-6 py-6 text-sm leading-7 text-blue-50/85 sm:px-8 sm:text-base sm:leading-8">
{`// Level up your coding skills
function solve(arr) {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      max = Math.max(max, arr[i] + arr[j]);
    }
  }
  return max;
}

console.log(solve([1, 8, 3, 6, 10])); // 16`}
                </pre>

                <div className="mx-5 mb-5 rounded-3xl border border-blue-300/12 bg-blue-950/62 p-4 sm:mx-6 sm:mb-6">
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-lime-300/40 bg-lime-300/10 text-lime-200">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-sm font-semibold text-white">Great job! Your code passed all test cases.</div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-[#67d8ff] via-[#2d7dff] to-[#ff7cbd]" />
                      </div>
                    </div>
                    <span className="hidden text-sm font-bold text-blue-100/70 sm:block">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {learningFlow.map((item, index) => (
                <div key={item.title} className="rounded-3xl bg-white/[0.035] p-7 text-center backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.055]">
                  <p className="text-sm font-extrabold text-[#ff7cbd]">0{index + 1}</p>
                  <h2 className="mt-3 text-xl font-bold text-white">{item.title}</h2>
                  <p className="mt-3 text-base leading-7 text-blue-100/60">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="courses" className="relative py-24 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionIntro
              title="Popular Courses"
              text="Structured tracks for coding fundamentals, interview readiness, and real-world shipping."
            />

            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <CourseCard key={course.title} course={course} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section id="founder" className="relative py-28 sm:py-32 lg:py-40">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#03102d] to-transparent" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-5xl pb-6 text-center">
              <SectionIntro
                title="Learn from engineers who connect coding with real industry work."
                text="LevelPro combines Java DSA practice, analytics thinking, automation discipline, and career mentorship so students build skill with context."
              />
            </div>

            <div className="mt-20 space-y-20 lg:space-y-24">
              {instructors.map((instructor, index) => (
                <InstructorProfile
                  key={instructor.name}
                  instructor={instructor}
                  reverse={index % 2 === 1}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
