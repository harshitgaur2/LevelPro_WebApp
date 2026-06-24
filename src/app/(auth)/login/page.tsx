"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { requestOtp } from "@/lib/api";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
});

const adminSchema = z.object({
  adminPassword: z.string().min(8, "Enter the admin password"),
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type AdminValues = z.infer<typeof adminSchema>;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [step, setStep] = useState<"email" | "otp" | "admin">("email");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  const adminForm = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
  });

  const sendOtp = async (data: EmailValues) => {
    setIsLoading(true);
    setAuthError(null);
    setStatusMessage(null);

    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      if (normalizedEmail === "admin@levelproedu.com") {
        setEmail(normalizedEmail);
        setStep("admin");
        setStatusMessage("Admin email detected. Enter the admin password to continue.");
        return;
      }

      const response = await requestOtp({
        email: normalizedEmail,
        purpose: "login",
      });

      setEmail(normalizedEmail);
      setStatusMessage(response.message);
      setStep("otp");
    } catch (error: unknown) {
      setAuthError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: OtpValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        otp: data.otp,
        purpose: "login",
        callbackUrl,
      });

      if (result?.error) {
        setAuthError("Invalid or expired OTP. Please request a new code.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error: unknown) {
      setAuthError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (data: AdminValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: data.adminPassword,
        callbackUrl: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
      });

      if (result?.error) {
        setAuthError("Invalid admin email or password.");
        return;
      }

      router.push(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
      router.refresh();
    } catch (error: unknown) {
      setAuthError(errorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-blue-300/25 bg-[#061538]/95 shadow-2xl shadow-blue-950/50">
      <CardContent className="px-5 py-8 sm:px-10 sm:py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-heading text-white">Welcome back</h2>
          <p className="mt-2 text-base text-blue-100/70">
            Enter your email to continue
          </p>
        </div>

        {authError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p>{statusMessage}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              {...emailForm.register("email")}
              error={emailForm.formState.errors.email?.message}
              disabled={isLoading}
              className="h-14 text-base"
            />

            <Button type="submit" className="h-14 w-full bg-gradient-to-r from-[#2563eb] to-[#ff0183] text-base font-bold shadow-lg shadow-blue-950/40 hover:brightness-110" isLoading={isLoading}>
              Continue
            </Button>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-5">
            <div className="rounded-xl border border-blue-300/15 bg-blue-950/50 p-4 text-sm text-blue-100/75">
              Code sent to <span className="font-semibold text-white">{email}</span>. Check your inbox and spam folder.
            </div>

            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              label="6-digit OTP"
              placeholder="123456"
              leftIcon={<KeyRound className="h-5 w-5" />}
              {...otpForm.register("otp")}
              error={otpForm.formState.errors.otp?.message}
              disabled={isLoading}
              className="h-14 text-center text-lg tracking-[0.35em]"
            />

            <Button type="submit" className="h-14 w-full text-base" isLoading={isLoading}>
              Verify & continue
            </Button>
            <button
              type="button"
              className="w-full text-sm font-medium text-[#67d8ff] transition hover:text-white"
              onClick={() => {
                setStep("email");
                setAuthError(null);
                setStatusMessage(null);
              }}
            >
              Use a different email
            </button>
          </form>
        ) : (
          <form onSubmit={adminForm.handleSubmit(adminLogin)} className="space-y-5">
            <div className="rounded-2xl border border-[#67d8ff]/18 bg-[#67d8ff]/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#67d8ff]" />
                <div>
                  <p className="font-semibold text-white">Admin login</p>
                  <p className="mt-1 text-sm text-blue-100/65">
                    Password required for <span className="font-semibold text-white">{email}</span>
                  </p>
                </div>
              </div>
            </div>

            <Input
              id="adminPassword"
              type="password"
              label="Admin password"
              placeholder="Enter admin password"
              leftIcon={<Lock className="h-5 w-5" />}
              {...adminForm.register("adminPassword")}
              error={adminForm.formState.errors.adminPassword?.message}
              disabled={isLoading}
              className="h-14 text-base"
            />

            <Button
              type="submit"
              variant="secondary"
              className="h-14 w-full border-[#67d8ff]/35 bg-[#67d8ff]/10 text-[#67d8ff] hover:bg-[#67d8ff] hover:text-[#020817]"
              isLoading={isLoading}
            >
              Open Admin Dashboard
            </Button>
            <button
              type="button"
              className="w-full text-sm font-medium text-[#67d8ff] transition hover:text-white"
              onClick={() => {
                setStep("email");
                setEmail("");
                setAuthError(null);
                setStatusMessage(null);
                adminForm.reset();
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="mt-7 text-center text-base text-blue-100/68">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#67d8ff] transition hover:text-white">
            Sign up
          </Link>
        </div>

      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-[520px] w-full animate-shimmer rounded-2xl bg-surface-hover" />}>
      <LoginForm />
    </Suspense>
  );
}
