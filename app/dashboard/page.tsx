import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Flame, Gauge, Target } from "lucide-react";
import type { Achievement, UserAchievement } from "@prisma/client";
import { db } from "@/lib/db";
import { movingAverage7, calculateStreak, weeklyAverages, projectGoalDate, detectPlateau } from "@/lib/analytics";
import { quoteForToday } from "@/lib/quotes";
import { levelProgress } from "@/lib/progression";
import { nextLockedTheme } from "@/lib/achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuickAddForm } from "@/components/dashboard/quick-add-form";
import { WeightChart } from "@/components/dashboard/weight-chart";
import { AchievementPreview } from "@/components/dashboard/achievement-preview";
import { formatWeight } from "@/lib/utils";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await db.userProfile.findFirst();
  if (!profile) redirect("/onboarding");

  const entries = await db.weightEntry.findMany({ where: { user_id: profile.id }, orderBy: { date: "asc" } });
  const progress =
    (await db.userProgress.findUnique({ where: { user_id: profile.id } })) ??
    ({ xp_total: 0, level: 1 } as { xp_total: number; level: number });

  const quote = quoteForToday();
  const moving = movingAverage7(entries);
  const latest = entries[entries.length - 1];
  const start = profile.start_weight_kg;
  const weekly = weeklyAverages(entries);
  const weeklyAverage = weekly.length ? weekly[weekly.length - 1].average : null;
  const sevenDaysAgo = entries.slice(-7);
  const change7 = latest && sevenDaysAgo.length ? latest.weight_kg - sevenDaysAgo[0].weight_kg : 0;
  const projected = projectGoalDate(entries, profile.goal_weight_kg);
  const streak = calculateStreak(entries);
  const plateau = detectPlateau(entries);

  const achievements: Achievement[] = await db.achievement.findMany({ orderBy: { id: "asc" } });
  const unlocked: Array<UserAchievement & { achievement: Achievement }> = await db.userAchievement.findMany({
    where: { user_id: profile.id },
    include: { achievement: true },
    orderBy: { unlocked_at: "desc" }
  });

  const unlockedIds = new Set(unlocked.map((item: { achievement_id: number }) => item.achievement_id));
  const nextAchievement = achievements.find((achievement: Achievement) => !unlockedIds.has(achievement.id));
  const recent = unlocked.slice(0, 3).map((item: { achievement: { title: string } }) => item.achievement.title);

  const chartData = entries.map((entry, idx) => ({
    date: entry.date.toISOString(),
    weight: entry.weight_kg,
    movingAverage: moving[idx]?.value ?? entry.weight_kg
  }));

  const level = levelProgress(progress.xp_total);
  const nextTheme = nextLockedTheme(level.level);

  return (
    <section className="space-y-6">
      <AppNav />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{profile.title} {profile.name}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Weight</p>
              <p className="font-display text-2xl font-semibold">
                {latest ? formatWeight(latest.weight_kg, profile.unit_pref) : "No entries"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Change Since Start</p>
              <p className="text-xl font-semibold">{latest ? (latest.weight_kg - start).toFixed(1) : "0.0"} kg</p>
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Last 7 Days</p>
              <p className="text-xl font-semibold">{change7.toFixed(1)} kg</p>
            </div>
            <div className="flex items-center gap-2 text-sm"><Flame className="h-4 w-4" /> {streak} day streak</div>
            <div className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4" /> {weeklyAverage?.toFixed(1) ?? "-"} kg avg</div>
            <div className="flex items-center gap-2 text-sm"><Target className="h-4 w-4" /> {projected ? format(projected, "PP") : "No projection"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{quote.category}</p>
            <p className="mt-2 text-lg">&ldquo;{quote.text}&rdquo;</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WeightChart data={chartData} />

        <div className="space-y-4">
          <QuickAddForm todayDate={new Date().toISOString().slice(0, 10)} />
          <AchievementPreview
            next={
              nextAchievement
                ? { title: nextAchievement.title, current: 0, target: 1 }
                : null
            }
            recent={recent}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Level {level.level}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={level.percent} />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{level.toNext} XP to next level</p>
          <p className="text-sm">Next unlock: {nextTheme ? `${nextTheme[0]} (level ${nextTheme[1]})` : "All themes unlocked"}</p>
          {plateau && <p className="rounded-xl bg-amber-100 p-2 text-sm text-amber-900">Plateau detected: no decrease over 14 days.</p>}
        </CardContent>
      </Card>
    </section>
  );
}
