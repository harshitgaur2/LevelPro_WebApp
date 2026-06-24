"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { getProfile, updateProfile, uploadProfileAvatar } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, CheckCircle2, AlertCircle, Phone, Camera, GitBranch, Link2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

const profileSchema = z.object({
  phone: z
    .string()
    .min(8, "Phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
  college: z.string().min(1, "College name is required"),
  courseEnrolled: z.string().min(1, "Course enrolled is required"),
  graduationYear: z.string().regex(/^20[2-3]\d$/, "Invalid year"),
  stream: z.string().min(1, "Stream is required"),
  resumeUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  bio: z.string().max(1000, "Bio is too long").optional(),
  skills: z.string().max(1000, "Skills are too long").optional(),
  education: z.string().max(1000, "Education is too long").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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

function ProfileEditor() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const profile = profileData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: "",
      college: "",
      courseEnrolled: "DSA in Java",
      graduationYear: (currentYear + 1).toString(),
      stream: "",
      resumeUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      bio: "",
      skills: "",
      education: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || "",
        college: profile.college || "",
        courseEnrolled: profile.courseEnrolled || "DSA in Java",
        graduationYear: profile.graduationYear?.toString() || (currentYear + 1).toString(),
        stream: profile.stream || "",
        resumeUrl: profile.resumeUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        bio: profile.bio || "",
        skills: profile.skills || "",
        education: profile.education || "",
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => updateProfile({
      ...data,
      graduationYear: parseInt(data.graduationYear, 10),
    }),
    onSuccess: async () => {
      setSuccessMsg("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Update session to reflect profileCompleted = true
      await updateSession({ profileCompleted: true });
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarError("");

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 650_000) {
      setAvatarError("Profile picture must be under 650 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploadingAvatar(true);
        const image = reader.result?.toString() || "";
        const response = await uploadProfileAvatar(image);
        await updateSession({ image: response.data.image });
        setSuccessMsg("Profile picture updated");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (error) {
        setAvatarError((error as Error).message || "Failed to upload profile picture.");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isProfileLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-9 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-normal text-text sm:text-5xl">Profile Settings</h1>
        <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
          Manage your personal information and academic details.
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        {/* Personal Info Card (Read-only from NextAuth) */}
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic info managed via your account provider.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left lg:flex-col lg:text-center">
            <Avatar src={session?.user?.image} name={session?.user?.name} size="xl" className="h-24 w-24 shadow-sm" />
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-text">{session?.user?.name}</h3>
              <p className="text-text-secondary">{session?.user?.email}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start lg:justify-center">
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 text-sm font-semibold text-primary-500 transition hover:bg-primary-500 hover:text-white">
                  <Camera className="h-4 w-4" />
                  {isUploadingAvatar ? "Uploading..." : "Upload photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
                <div className="inline-block rounded bg-surface-hover px-2 py-1 text-xs font-medium text-text-muted">
                  Role: {session?.user?.role || "STUDENT"}
                </div>
              </div>
              {avatarError && <p className="mt-2 text-sm text-red-500">{avatarError}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Academic Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Academic & Career Profile</CardTitle>
            <CardDescription>This information helps LevelPro and companies understand your goals.</CardDescription>
          </CardHeader>
          <CardContent>
            {successMsg && (
              <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {updateMutation.isError && (
              <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{(updateMutation.error as Error).message || "Failed to update profile"}</p>
              </div>
            )}

            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Input
                    label="Phone number"
                    placeholder="+91 98765 43210"
                    leftIcon={<Phone className="h-4 w-4" />}
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="College / University"
                    placeholder="e.g. Indian Institute of Technology"
                    {...register("college")}
                    error={errors.college?.message}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Select
                    label="Course enrolled"
                    options={courseOptions}
                    {...register("courseEnrolled")}
                    error={errors.courseEnrolled?.message}
                  />
                </div>

                <Select
                  label="Stream / Major"
                  options={streamOptions}
                  {...register("stream")}
                  error={errors.stream?.message}
                />

                <Select
                  label="Graduation Year"
                  options={yearOptions}
                  {...register("graduationYear")}
                  error={errors.graduationYear?.message}
                />
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <h3 className="mb-4 text-sm font-medium text-text">Career details</h3>
                <div className="grid gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-text">Short bio</span>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your coding interests, goals, and current preparation."
                      className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text placeholder-text-muted transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      {...register("bio")}
                    />
                    {errors.bio?.message && <p className="mt-1.5 text-sm text-red-500">{errors.bio.message}</p>}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-text">Skills</span>
                    <textarea
                      rows={3}
                      placeholder="Java, DSA, Selenium, React, SQL..."
                      className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text placeholder-text-muted transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      {...register("skills")}
                    />
                    {errors.skills?.message && <p className="mt-1.5 text-sm text-red-500">{errors.skills.message}</p>}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-text">Education summary</span>
                    <textarea
                      rows={3}
                      placeholder="Degree, college, graduation year, academic highlights."
                      className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-text placeholder-text-muted transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      {...register("education")}
                    />
                    {errors.education?.message && <p className="mt-1.5 text-sm text-red-500">{errors.education.message}</p>}
                  </label>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <h3 className="text-sm font-medium text-text mb-4">Links</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Resume URL"
                    placeholder="https://drive.google.com/... or https://your-portfolio.com"
                    helperText="Link to your hosted resume (Google Drive, Dropbox, etc.)"
                    {...register("resumeUrl")}
                    error={errors.resumeUrl?.message}
                  />

                  <Input
                    label="LinkedIn Profile"
                    placeholder="https://linkedin.com/in/username"
                    leftIcon={<Link2 className="h-4 w-4" />}
                    {...register("linkedinUrl")}
                    error={errors.linkedinUrl?.message}
                  />

                  <Input
                    label="GitHub Profile"
                    placeholder="https://github.com/username"
                    leftIcon={<GitBranch className="h-4 w-4" />}
                    {...register("githubUrl")}
                    error={errors.githubUrl?.message}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={updateMutation.isPending}
                  disabled={!isDirty || updateMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileEditor />
    </ErrorBoundary>
  );
}
