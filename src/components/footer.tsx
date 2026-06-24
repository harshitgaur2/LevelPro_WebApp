import React from "react";
import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./ui/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#020817] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex-shrink-0 flex items-center mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-blue-100/65 mb-4">
              Helping students learn coding, build real projects, and become career-ready.
            </p>
            <div className="flex space-x-4 text-blue-100/55">
              <a href="#" className="hover:text-[#67d8ff] transition-colors">
                <span className="sr-only">Contact</span>
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#67d8ff] transition-colors">
                <span className="sr-only">Social</span>
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#67d8ff] transition-colors">
                <span className="sr-only">Website</span>
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Learning</h3>
            <ul className="space-y-3 text-sm text-blue-100/62">
              <li><Link href="/#courses" className="hover:text-[#67d8ff] transition-colors">Browse Courses</Link></li>
              <li><Link href="/#courses" className="hover:text-[#67d8ff] transition-colors">DSA in Java</Link></li>
              <li><Link href="/#courses" className="hover:text-[#67d8ff] transition-colors">Resume Masterclass</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#67d8ff] transition-colors">My Learning</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-blue-100/62">
              <li><Link href="/#founder" className="hover:text-[#67d8ff] transition-colors">Founder</Link></li>
              <li><Link href="/#courses" className="hover:text-[#67d8ff] transition-colors">Interview Prep</Link></li>
              <li><Link href="/#courses" className="hover:text-[#67d8ff] transition-colors">Git/GitHub Sprint</Link></li>
              <li><Link href="/signup" className="hover:text-[#67d8ff] transition-colors">Start Free</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-blue-100/62">
              <li><Link href="/login" className="hover:text-[#67d8ff] transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-[#67d8ff] transition-colors">Sign up</Link></li>
              <li><Link href="/admin/students" className="hover:text-[#67d8ff] transition-colors">Admin Students</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#67d8ff] transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-blue-100/48">
          <p>&copy; {new Date().getFullYear()} LevelPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
