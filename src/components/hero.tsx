import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Zap, Target, Award } from "lucide-react";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-surface py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] max-w-7xl mx-auto opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-soft" />
        <div className="absolute top-32 left-1/4 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 font-medium text-sm mb-8 animate-fade-in border border-primary-100 dark:border-primary-800">
          <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          Placement Season 2025 is Live
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold font-heading tracking-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Level up your career with <br className="hidden lg:block" />
          <span className="gradient-text">Top Companies</span>
        </h1>
        
        <p className="mt-4 text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          The ultimate placement portal for Indian students. Find internships,
          placement programs, and land your dream job with zero friction.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Get Started for Free
            </Button>
          </Link>
          <Link href="/companies">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
              Explore Companies
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="p-6 rounded-2xl bg-surface-elevated border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Fast Applications</h3>
            <p className="text-text-secondary text-sm">Apply to multiple companies with a single profile. No more repetitive form filling.</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface-elevated border border-border">
            <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center text-accent-600 dark:text-accent-400 mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Curated Matches</h3>
            <p className="text-text-secondary text-sm">Discover programs tailored to your skills, stream, and graduation year.</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface-elevated border border-border">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Verified Companies</h3>
            <p className="text-text-secondary text-sm">Every company and program on LevelPro is vetted for authenticity and quality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
