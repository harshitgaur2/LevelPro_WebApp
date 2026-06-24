import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020817] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="code-grid absolute inset-0 opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 rounded-full bg-blue-500/20 filter blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 rounded-full bg-[#ff0183]/20 filter blur-[100px] animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <ArrowLeft className="w-4 h-4 text-blue-100/55 group-hover:text-[#67d8ff] transition-colors" />
            <span className="text-sm font-medium text-blue-100/55 group-hover:text-white transition-colors">
              Back to Home
            </span>
          </Link>
        </div>
        <Link href="/" className="flex justify-center items-center gap-2">
          <Logo />
        </Link>
      </div>

      <div className="relative z-10 mt-6 w-full max-w-xl animate-slide-up">
        {children}
      </div>
    </div>
  );
}
