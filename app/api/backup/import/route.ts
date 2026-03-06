import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { syncGamification, unlockAchievementByKey } from "@/lib/achievements";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.profile || !Array.isArray(payload?.entries)) {
    return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
  }

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.userAchievement.deleteMany({});
    await tx.weightEntry.deleteMany({});
    await tx.userProgress.deleteMany({});
    await tx.userProfile.deleteMany({});

    const profile = await tx.userProfile.create({
      data: {
        name: payload.profile.name,
        height_cm: payload.profile.height_cm,
        start_weight_kg: payload.profile.start_weight_kg,
        goal_weight_kg: payload.profile.goal_weight_kg,
        sex: payload.profile.sex ?? null,
        date_of_birth: payload.profile.date_of_birth ? new Date(payload.profile.date_of_birth) : null,
        unit_pref: payload.profile.unit_pref,
        theme: payload.profile.theme,
        accent_theme: payload.profile.accent_theme ?? "clean-light",
        title: payload.profile.title ?? "Awakening",
        pin_hash: payload.profile.pin_hash ?? null
      }
    });

    for (const entry of payload.entries) {
      await tx.weightEntry.create({
        data: {
          user_id: profile.id,
          date: new Date(entry.date),
          weight_kg: entry.weight_kg,
          waist_cm: entry.waist_cm ?? null,
          note: entry.note ?? null
        }
      });
    }

    if (Array.isArray(payload.achievements)) {
      for (const item of payload.achievements) {
        const achievement = await tx.achievement.findUnique({ where: { key: item.key } });
        if (!achievement) continue;
        await tx.userAchievement.create({
          data: {
            user_id: profile.id,
            achievement_id: achievement.id,
            unlocked_at: item.unlocked_at ? new Date(item.unlocked_at) : new Date()
          }
        });
      }
    }

    await tx.userProgress.create({
      data: {
        user_id: profile.id,
        xp_total: payload.progress?.xp_total ?? 0,
        level: payload.progress?.level ?? 1,
        last_daily_xp_date: payload.progress?.last_daily_xp_date
          ? new Date(payload.progress.last_daily_xp_date)
          : null
      }
    });
  });

  const profile = await db.userProfile.findFirst();
  if (profile) {
    await unlockAchievementByKey(profile.id, "IMPORT_BACKUP");
    await syncGamification(profile.id);
  }

  return NextResponse.json({ ok: true });
}
