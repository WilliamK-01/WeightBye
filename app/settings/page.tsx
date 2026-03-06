import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SettingsClient } from "@/components/settings/settings-client";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await db.userProfile.findFirst();
  if (!profile) redirect("/onboarding");

  const progress = await db.userProgress.findUnique({ where: { user_id: profile.id } });

  return (
    <section className="space-y-4">
      <AppNav />
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <SettingsClient
        profile={{
          height_cm: profile.height_cm,
          goal_weight_kg: profile.goal_weight_kg,
          unit_pref: profile.unit_pref,
          accent_theme: profile.accent_theme,
          title: profile.title
        }}
        level={progress?.level ?? 1}
      />
    </section>
  );
}
