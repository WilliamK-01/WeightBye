import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function HomePage() {
  const profile = await db.userProfile.findFirst();
  if (profile) {
    redirect("/dashboard");
  }
  redirect("/onboarding");
}
