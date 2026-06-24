"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { AlertCircle, CheckCircle2, KeyRound, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { requestOtp } from "@/lib/api";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  acceptTerms: z.literal(true, {
    error: "You must accept the terms and conditions",
  }),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
});

type SignupValues = z.infer<typeof signupSchema>;
type OtpValues = z.infer<typeof otpSchema>;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  const sendOtp = async (data: SignupValues) => {
    setIsLoading(true);
    setAuthError(null);
    setStatusMessage(null);

    try {
      const normalizedEmail = data.email.trim().toLowerCase();
      const response = await requestOtp({
        name: data.name.trim(),
        email: normalizedEmail,
        purpose: "signup",
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
        purpose: "signup",
        callbackUrl: "/profile/setup",
      });

      if (result?.error) {
        setAuthError("Invalid or expired OTP. Please request a new code.");
        return;
      }

      router.push("/profile/setup");
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
          <h2 className="text-3xl font-bold font-heading text-white">Create your account</h2>
          <p className="mt-2 text-base text-blue-100/70">
            Verify your email, then complete your learner profile
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

        {step === "details" ? (
          <form onSubmit={signupForm.handleSubmit(sendOtp)} className="space-y-5">
            <Input
              id="name"
              type="text"
              label="Full name"
              placeholder="Harshit Gaur"
              leftIcon={<User className="h-5 w-5" />}
              {...signupForm.register("name")}
              error={signupForm.formState.errors.name?.message}
              disabled={isLoading}
              className="h-14 text-base"
            />

            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              {...signupForm.register("email")}
              error={signupForm.formState.errors.email?.message}
              disabled={isLoading}
              className="h-14 text-base"
            />

            <div className="flex items-start gap-3 pt-1">
              <input
                id="acceptTerms"
                type="checkbox"
                {...signupForm.register("acceptTerms")}
                className="mt-1 h-5 w-5 rounded border-white/20 bg-blue-950 text-primary-600 focus:ring-primary-500"
              />
              <div className="text-sm leading-6">
                <label htmlFor="acceptTerms" className="font-medium text-blue-100/75">
                  I accept the{" "}
                  <a href="#" className="text-[#67d8ff] hover:text-white">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-[#67d8ff] hover:text-white">Privacy Policy</a>
                </label>
                {signupForm.formState.errors.acceptTerms && (
                  <p className="mt-1 text-sm text-red-300">
                    {signupForm.formState.errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="h-14 w-full bg-gradient-to-r from-[#2563eb] to-[#ff0183] text-base font-bold shadow-lg shadow-blue-950/40 hover:brightness-110" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>
        ) : (
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
              Verify & complete profile
            </Button>
            <button
              type="button"
              className="w-full text-sm font-medium text-[#67d8ff] transition hover:text-white"
              onClick={() => {
                setStep("details");
                setAuthError(null);
                setStatusMessage(null);
              }}
            >
              Edit signup details
            </button>
          </form>
        )}

        <div className="mt-7 text-center text-base text-blue-100/68">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#67d8ff] transition hover:text-white">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-[620px] w-full animate-shimmer rounded-2xl bg-surface-hover" />}>
      <SignupForm />
    </Suspense>
  );
}
