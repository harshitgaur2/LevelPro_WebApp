import { redirect } from "next/navigation";

export default function AdminLearningRedirectPage() {
  redirect("/admin/courses");
}
