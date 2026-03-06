import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LogClient } from "@/components/log/log-client";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const profile = await db.userProfile.findFirst();
  if (!profile) redirect("/onboarding");

  const entries = await db.weightEntry.findMany({ where: { user_id: profile.id }, orderBy: { date: "desc" } });

  return (
    <section className="space-y-4">
      <AppNav />
      <h1 className="font-display text-3xl font-semibold">Log History</h1>
      <LogClient
        entries={entries.map((entry) => ({
          ...entry,
          date: entry.date.toISOString()
        }))}
      />
    </section>
  );
}
