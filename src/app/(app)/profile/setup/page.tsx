"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { ArrowRight, BookOpen, GraduationCap, Phone, Sparkles } from "lucide-react";
import { updateProfile } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ErrorBoundary } from "@/components/error-boundary";

const setupSchema = z.object({
  phone: z
    .string()
    .min(8, "Phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
  college: z.string().min(1, "College name is required"),
  courseEnrolled: z.string().min(1, "Course enrolled is required"),
  graduationYear: z.string().regex(/^20[2-3]\d$/, "Invalid year"),
  stream: z.string().min(1, "Stream is required"),
});

type SetupFormValues = z.infer<typeof setupSchema>;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - 2 + i;
  return { label: year.toString(), value: year.toString() };
});

const streamOptions = [
  { label: "Computer Science & Engineering", value: "Computer Science & Engineering" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Electronics & Communication", value: "Electronics & Communication" },
  { label: "Mechanical Engineering", value: "Mechanical Engineering" },
  { label: "Civil Engineering", value: "Civil Engineering" },
  { label: "Electrical Engineering", value: "Electrical Engineering" },
  { label: "BCA / MCA", value: "BCA / MCA" },
  { label: "BBA / MBA", value: "BBA / MBA" },
  { label: "Other", value: "Other" },
];

const courseOptions = [
  { label: "DSA in Java", value: "DSA in Java" },
  { label: "Resume Masterclass", value: "Resume Masterclass" },
  { label: "Full Stack Foundations", value: "Full Stack Foundations" },
  { label: "Interview Prep", value: "Interview Prep" },
  { label: "Git/GitHub Sprint", value: "Git/GitHub Sprint" },
  { label: "Not sure yet", value: "Not sure yet" },
];

function ProfileSetup() {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      phone: "",
      college: "",
      courseEnrolled: "DSA in Java",
      graduationYear: (currentYear + 1).toString(),
      stream: "",
    },
  });

  const setupMutation = useMutation({
    mutationFn: (data: SetupFormValues) =>
      updateProfile({
        ...data,
        graduationYear: parseInt(data.graduationYear, 10),
      }),
    onSuccess: async () => {
      await updateSession({ profileCompleted: true });
      router.push("/dashboard");
      router.refresh();
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="code-grid absolute inset-0 opacity-45" />
      <div className="absolute left-[-12%] top-[-20%] h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-18%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#ff0183]/18 blur-[120px]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="text-center lg:text-left">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-[#67d8ff] lg:mx-0">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Complete your learner profile
          </h1>
          <p className="mt-4 text-lg leading-8 text-blue-100/72">
            Tell us what you&apos;re studying and which LevelPro course you want
            to focus on first.
          </p>
          <div className="mt-8 grid gap-3 text-left">
            {[
              ["Personal contact", "Phone number for class updates"],
              ["Academic details", "College, stream, and graduation year"],
              ["Learning track", "The course you want to start with"],
            ].map(([title, text]) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Sparkles className="h-5 w-5 text-[#ff4aad]" />
                <div>
                  <div className="font-semibold text-white">{title}</div>
                  <div className="text-sm text-blue-100/60">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full border-blue-300/25 bg-[#061538]/95 shadow-2xl shadow-blue-950/50">
          <CardContent className="px-5 py-8 sm:px-10 sm:py-10">
            {setupMutation.isError && (
              <div className="mb-6 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-200">
                {(setupMutation.error as Error).message || "Failed to save profile. Please try again."}
              </div>
            )}

            <form onSubmit={handleSubmit((data) => setupMutation.mutate(data))} className="space-y-5">
              <Input
                label="Phone number"
                placeholder="+91 98765 43210"
                leftIcon={<Phone className="h-5 w-5" />}
                {...register("phone")}
                error={errors.phone?.message}
                disabled={setupMutation.isPending}
                className="h-14 text-base"
              />

              <Input
                label="College / University"
                placeholder="e.g. Delhi Technological University"
                leftIcon={<GraduationCap className="h-5 w-5" />}
                {...register("college")}
                error={errors.college?.message}
                disabled={setupMutation.isPending}
                className="h-14 text-base"
              />

              <Select
                label="Course enrolled"
                options={courseOptions}
                {...register("courseEnrolled")}
                error={errors.courseEnrolled?.message}
                disabled={setupMutation.isPending}
                className="h-14 text-base"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select
                  label="Stream / Major"
                  options={streamOptions}
                  {...register("stream")}
                  error={errors.stream?.message}
                  disabled={setupMutation.isPending}
                  className="h-14 text-base"
                />

                <Select
                  label="Graduation Year"
                  options={yearOptions}
                  {...register("graduationYear")}
                  error={errors.graduationYear?.message}
                  disabled={setupMutation.isPending}
                  className="h-14 text-base"
                />
              </div>

              <div className="rounded-2xl border border-blue-300/15 bg-blue-950/45 p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-[#67d8ff]" />
                  <p className="text-sm leading-6 text-blue-100/70">
                    You can add resume links, LinkedIn, and certificates later from profile settings.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="h-14 w-full bg-gradient-to-r from-[#2563eb] to-[#ff0183] text-base font-bold shadow-lg shadow-blue-950/40 hover:brightness-110"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                isLoading={setupMutation.isPending}
              >
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <ErrorBoundary>
      <ProfileSetup />
    </ErrorBoundary>
  );
}
