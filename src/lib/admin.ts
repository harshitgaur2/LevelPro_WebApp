import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin(callbackUrl = "/admin") {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
