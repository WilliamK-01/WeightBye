import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementView } from "@/lib/achievements";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const profile = await db.userProfile.findFirst();
  if (!profile) redirect("/onboarding");

  const achievements = await achievementView(profile.id);

  return (
    <section className="space-y-4">
      <AppNav />
      <h1 className="font-display text-3xl font-semibold">Achievements</h1>
      <AchievementGrid achievements={achievements} />
    </section>
  );
}
