import React from "react";
import { Lock, Mail, Settings, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <header className="animate-slide-up">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#67d8ff]">Settings</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Admin settings</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/65">
          Current secure defaults for the LevelPro admin workspace.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Admin account",
            text: "Use the requested LevelPro admin email to access protected admin routes.",
            value: "admin@levelproedu.com",
            icon: Mail,
          },
          {
            title: "Role protection",
            text: "Admin pages use server-side session role checks before showing database data.",
            value: "ADMIN only",
            icon: ShieldCheck,
          },
          {
            title: "Password login",
            text: "Students continue using OTP login, while admins can use password login.",
            value: "Enabled",
            icon: Lock,
          },
        ].map(({ title, text, value, icon: Icon }) => (
          <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#67d8ff]/10 text-[#67d8ff]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-xl font-extrabold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100/58">{text}</p>
            <p className="mt-5 rounded-2xl bg-[#020817]/55 px-4 py-3 text-sm font-bold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#061538]/90 p-7 shadow-2xl shadow-blue-950/35 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ff1683]/12 text-pink-100">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Production note</h2>
            <p className="mt-3 max-w-3xl text-blue-100/62">
              For production, move the admin credentials into environment variables and rotate the password before launch.
              The current value is implemented only because it was explicitly requested for this build.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
