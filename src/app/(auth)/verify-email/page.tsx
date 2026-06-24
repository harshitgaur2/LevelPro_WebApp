"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  const hasVerificationParams = Boolean(token && email);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    hasVerificationParams ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    hasVerificationParams
      ? "Verifying your email..."
      : "Invalid verification link. Missing token or email."
  );

  useEffect(() => {
    if (!token || !email) {
      return;
    }

    verifyEmail(token, email)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to verify email.");
      });
  }, [token, email]);

  return (
    <Card className="shadow-xl shadow-primary-500/5 border-border/50 text-center">
      <CardContent className="px-4 py-12 sm:px-10 flex flex-col items-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold font-heading text-text mb-2">Verifying Email</h2>
            <p className="text-text-secondary">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text mb-2">Email Verified!</h2>
            <p className="text-text-secondary mb-8">{message}</p>
            <Link href="/login" className="w-full">
              <Button className="w-full">Sign in to continue</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text mb-2">Verification Failed</h2>
            <p className="text-text-secondary mb-8">{message}</p>
            <Link href="/signup" className="w-full">
              <Button variant="secondary" className="w-full">Back to sign up</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-[400px] w-full animate-shimmer bg-surface-hover rounded-2xl" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
