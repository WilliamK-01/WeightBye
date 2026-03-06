import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlockAchievementByKey } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";

  const entries = await db.weightEntry.findMany({ where: { user_id: profile.id }, orderBy: { date: "asc" } });
  const progress = await db.userProgress.findUnique({ where: { user_id: profile.id } });
  const achievements = await db.userAchievement.findMany({ where: { user_id: profile.id }, include: { achievement: true } });

  await unlockAchievementByKey(profile.id, "EXPORT_BACKUP");

  if (format === "csv") {
    const lines = ["date,weight_kg,waist_cm,note"];
    for (const entry of entries) {
      lines.push(
        `${entry.date.toISOString().slice(0, 10)},${entry.weight_kg},${entry.waist_cm ?? ""},"${(entry.note ?? "").replace(/"/g, '""')}"`
      );
    }

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=localweight-entries.csv"
      }
    });
  }

  const payload = {
    profile,
    entries,
    progress,
    achievements: achievements.map((item: { achievement: { key: string }; unlocked_at: Date }) => ({
      key: item.achievement.key,
      unlocked_at: item.unlocked_at
    }))
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=localweight-backup.json"
    }
  });
}
