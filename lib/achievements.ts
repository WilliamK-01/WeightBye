import { differenceInCalendarDays, formatISO, startOfDay } from "date-fns";
import type { Achievement, WeightEntry } from "@prisma/client";
import { db } from "@/lib/db";
import { calculateStreak, weeklyAverages } from "@/lib/analytics";
import { levelFromXp, xpFromEntry } from "@/lib/progression";
import { THEME_UNLOCK_LEVELS } from "@/lib/unlocks";

type Context = {
  entries: WeightEntry[];
  startWeightKg: number;
  goalWeightKg: number;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  heightCm: number;
  dashboardDaysVisited: number;
  title: string;
  level: number;
};

function countMorningEntries(entries: WeightEntry[]) {
  return entries.filter((entry) => entry.created_at.getHours() < 9).length;
}

function maxStreak(entries: WeightEntry[]) {
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map((entry) => formatISO(entry.date, { representation: "date" })))].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const prev = new Date(dates[i - 1]);
    const now = new Date(dates[i]);
    if (differenceInCalendarDays(now, prev) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function noteStreak(entries: WeightEntry[]) {
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  let best = 0;
  let current = 0;
  for (const entry of sorted) {
    if (entry.note && entry.note.trim()) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function hasBreakComeback(entries: WeightEntry[]) {
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  for (let i = 1; i < sorted.length; i += 1) {
    if (differenceInCalendarDays(startOfDay(sorted[i].date), startOfDay(sorted[i - 1].date)) >= 7) {
      return true;
    }
  }
  return false;
}

function estimateBmi(weightKg: number, heightCm: number) {
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

function unlocked(key: string, ctx: Context) {
  const entries = ctx.entries;
  const latest = entries.length ? entries[entries.length - 1] : null;
  const loss = entries.length
    ? ctx.startWeightKg - Math.min(...entries.map((entry) => entry.weight_kg))
    : 0;

  switch (key) {
    case "FIRST_ENTRY":
      return entries.length >= 1;
    case "STREAK_3":
      return calculateStreak(entries) >= 3;
    case "STREAK_7":
      return calculateStreak(entries) >= 7;
    case "STREAK_14":
      return calculateStreak(entries) >= 14;
    case "STREAK_30":
      return calculateStreak(entries) >= 30;
    case "STREAK_60":
      return calculateStreak(entries) >= 60;
    case "STREAK_100":
      return calculateStreak(entries) >= 100;
    case "NEW_LOW_WEIGHT":
      return !!latest && latest.weight_kg <= Math.min(...entries.map((entry) => entry.weight_kg));
    case "WEIGHT_LOSS_1KG":
      return loss >= 1;
    case "WEIGHT_LOSS_3KG":
      return loss >= 3;
    case "WEIGHT_LOSS_5KG":
      return loss >= 5;
    case "WEIGHT_LOSS_10KG":
      return loss >= 10;
    case "WEIGHT_LOSS_15KG":
      return loss >= 15;
    case "GOAL_REACHED":
      return !!latest && latest.weight_kg <= ctx.goalWeightKg;
    case "LOG_NOTE_7":
      return entries.filter((entry) => !!entry.note?.trim()).length >= 7;
    case "WAIST_LOG_7":
      return entries.filter((entry) => typeof entry.waist_cm === "number").length >= 7;
    case "ENTRY_10":
      return entries.length >= 10;
    case "ENTRY_25":
      return entries.length >= 25;
    case "ENTRY_50":
      return entries.length >= 50;
    case "ENTRY_100":
      return entries.length >= 100;
    case "WEEKLY_AVG_4":
      return weeklyAverages(entries).length >= 4;
    case "WEEKLY_AVG_12":
      return weeklyAverages(entries).length >= 12;
    case "EARLY_BIRD_10":
      return countMorningEntries(entries) >= 10;
    case "NO_MISS_30":
      return maxStreak(entries) >= 30;
    case "NOTE_25":
      return entries.filter((entry) => !!entry.note?.trim()).length >= 25;
    case "WAIST_25":
      return entries.filter((entry) => typeof entry.waist_cm === "number").length >= 25;
    case "LOSS_RATE_STEADY":
      return entries.length >= 30 && loss >= 4;
    case "PLATEAU_BREAKER":
      return entries.length >= 28 && loss >= 2;
    case "RETURN_AFTER_BREAK":
      return hasBreakComeback(entries);
    case "TWO_WEEKS_NOTES":
      return noteStreak(entries) >= 14;
    case "FIVE_WEEK_STREAK":
      return maxStreak(entries) >= 35;
    case "BMI_UNDER_30":
      return !!latest && estimateBmi(latest.weight_kg, ctx.heightCm) < 30;
    case "BMI_UNDER_25":
      return !!latest && estimateBmi(latest.weight_kg, ctx.heightCm) < 25;
    case "THEME_UNLOCK_6":
      return ctx.level >= 6;
    case "THEME_UNLOCK_10":
      return ctx.level >= 10;
    case "TITLE_EQUIPPED":
      return ctx.title !== "Awakening";
    case "DASHBOARD_30":
      return ctx.dashboardDaysVisited >= 30;
    case "DARK_MODE_ENABLED":
      return ctx.themeMode === "DARK";
    default:
      return false;
  }
}

function progressForKey(key: string, ctx: Context) {
  const entries = ctx.entries;
  const loss = entries.length
    ? ctx.startWeightKg - Math.min(...entries.map((entry) => entry.weight_kg))
    : 0;

  const map: Record<string, { current: number; target: number }> = {
    STREAK_3: { current: calculateStreak(entries), target: 3 },
    STREAK_7: { current: calculateStreak(entries), target: 7 },
    STREAK_14: { current: calculateStreak(entries), target: 14 },
    STREAK_30: { current: calculateStreak(entries), target: 30 },
    STREAK_60: { current: calculateStreak(entries), target: 60 },
    STREAK_100: { current: calculateStreak(entries), target: 100 },
    WEIGHT_LOSS_1KG: { current: Math.max(0, loss), target: 1 },
    WEIGHT_LOSS_3KG: { current: Math.max(0, loss), target: 3 },
    WEIGHT_LOSS_5KG: { current: Math.max(0, loss), target: 5 },
    WEIGHT_LOSS_10KG: { current: Math.max(0, loss), target: 10 },
    WEIGHT_LOSS_15KG: { current: Math.max(0, loss), target: 15 },
    LOG_NOTE_7: { current: entries.filter((entry) => !!entry.note?.trim()).length, target: 7 },
    WAIST_LOG_7: { current: entries.filter((entry) => typeof entry.waist_cm === "number").length, target: 7 },
    ENTRY_10: { current: entries.length, target: 10 },
    ENTRY_25: { current: entries.length, target: 25 },
    ENTRY_50: { current: entries.length, target: 50 },
    ENTRY_100: { current: entries.length, target: 100 },
    THEME_UNLOCK_6: { current: ctx.level, target: 6 },
    THEME_UNLOCK_10: { current: ctx.level, target: 10 }
  };

  return map[key] ?? { current: unlocked(key, ctx) ? 1 : 0, target: 1 };
}

export async function syncGamification(userId: number, options?: { dashboardVisit?: boolean }) {
  const profile = await db.userProfile.findUnique({ where: { id: userId } });
  if (!profile) throw new Error("Profile not found");

  if (options?.dashboardVisit) {
    const key = `dashboard_days_${new Date().toISOString().slice(0, 10)}`;
    if (typeof globalThis !== "undefined") {
      (globalThis as Record<string, unknown>)[key] = true;
    }
  }

  const entries = await db.weightEntry.findMany({ where: { user_id: userId }, orderBy: { date: "asc" } });
  const defs: Achievement[] = await db.achievement.findMany({ orderBy: { id: "asc" } });
  const unlockedRows: Array<{ achievement_id: number; achievement: Achievement }> = await db.userAchievement.findMany({
    where: { user_id: userId },
    include: { achievement: true }
  });

  const xpFromLogs = entries.reduce((total, entry) => total + xpFromEntry(entry), 0);
  const provisionalLevel = levelFromXp(xpFromLogs + unlockedRows.reduce((t, row) => t + row.achievement.xp_reward, 0));
  const ctx: Context = {
    entries,
    startWeightKg: profile.start_weight_kg,
    goalWeightKg: profile.goal_weight_kg,
    themeMode: profile.theme as Context["themeMode"],
    heightCm: profile.height_cm,
    dashboardDaysVisited: 0,
    title: profile.title,
    level: provisionalLevel
  };

  const unlockedIds = new Set(unlockedRows.map((row) => row.achievement_id));
  const toUnlock = defs.filter((def) => !unlockedIds.has(def.id) && unlocked(def.key, ctx));

  for (const def of toUnlock) {
    await db.userAchievement.create({
      data: {
        user_id: userId,
        achievement_id: def.id
      }
    });
  }

  const allUnlocked: Array<{ achievement: Achievement }> = await db.userAchievement.findMany({
    where: { user_id: userId },
    include: { achievement: true }
  });
  const xpAchievements = allUnlocked.reduce((total, row) => total + row.achievement.xp_reward, 0);
  const xpTotal = xpFromLogs + xpAchievements;
  const level = levelFromXp(xpTotal);
  const previousLevel = (await db.userProgress.findUnique({ where: { user_id: userId } }))?.level ?? 1;

  await db.userProgress.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      xp_total: xpTotal,
      level,
      last_daily_xp_date: entries.length ? entries[entries.length - 1].date : null
    },
    update: {
      xp_total: xpTotal,
      level,
      last_daily_xp_date: entries.length ? entries[entries.length - 1].date : null
    }
  });

  return {
    toUnlock,
    levelUp: level > previousLevel,
    level,
    xpTotal,
    progressMap: Object.fromEntries(defs.map((def) => [def.key, progressForKey(def.key, { ...ctx, level })]))
  };
}

export async function unlockAchievementByKey(userId: number, key: string) {
  const achievement = await db.achievement.findUnique({ where: { key } });
  if (!achievement) return;

  await db.userAchievement.upsert({
    where: {
      user_id_achievement_id: {
        user_id: userId,
        achievement_id: achievement.id
      }
    },
    update: {},
    create: {
      user_id: userId,
      achievement_id: achievement.id
    }
  });

  return syncGamification(userId);
}

export async function achievementView(userId: number) {
  const profile = await db.userProfile.findUnique({ where: { id: userId } });
  const entries = await db.weightEntry.findMany({ where: { user_id: userId }, orderBy: { date: "asc" } });
  const progress = await db.userProgress.findUnique({ where: { user_id: userId } });

  if (!profile) return [];

  const defs: Achievement[] = await db.achievement.findMany({ orderBy: { category: "asc" } });
  const unlockedSet = new Set(
    (
      await db.userAchievement.findMany({
        where: { user_id: userId }
      })
    ).map((row) => row.achievement_id)
  );

  const ctx: Context = {
    entries,
    startWeightKg: profile.start_weight_kg,
    goalWeightKg: profile.goal_weight_kg,
    themeMode: profile.theme as Context["themeMode"],
    heightCm: profile.height_cm,
    dashboardDaysVisited: 0,
    title: profile.title,
    level: progress?.level ?? 1
  };

  return defs.map((def) => ({
    ...def,
    unlocked: unlockedSet.has(def.id),
    progress: progressForKey(def.key, ctx)
  }));
}

export function unlockedThemesForLevel(level: number) {
  return Object.entries(THEME_UNLOCK_LEVELS)
    .filter(([, required]) => level >= required)
    .map(([theme]) => theme);
}

export function nextLockedTheme(level: number) {
  const pending = Object.entries(THEME_UNLOCK_LEVELS)
    .filter(([, required]) => required > level)
    .sort((a, b) => a[1] - b[1]);
  return pending[0] ?? null;
}

export type AchievementCard = Achievement & {
  unlocked: boolean;
  progress: { current: number; target: number };
};
