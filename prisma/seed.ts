import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  ["FIRST_ENTRY", "First Log", "Log your first entry.", "Exploration", 50, "Star"],
  ["STREAK_3", "3 Day Spark", "Maintain a 3-day streak.", "Consistency", 80, "Flame"],
  ["STREAK_7", "Week Warrior", "Maintain a 7-day streak.", "Consistency", 120, "Flame"],
  ["STREAK_14", "Fortnight Focus", "Maintain a 14-day streak.", "Consistency", 180, "Flame"],
  ["STREAK_30", "Monthly Momentum", "Maintain a 30-day streak.", "Consistency", 260, "Flame"],
  ["STREAK_60", "Relentless", "Maintain a 60-day streak.", "Consistency", 420, "Flame"],
  ["STREAK_100", "Centurion", "Maintain a 100-day streak.", "Consistency", 700, "Flame"],
  ["NEW_LOW_WEIGHT", "New Low", "Hit your lowest recorded weight.", "Progress", 90, "TrendingDown"],
  ["WEIGHT_LOSS_1KG", "Minus 1", "Lose 1 kg from your start weight.", "Progress", 100, "Trophy"],
  ["WEIGHT_LOSS_3KG", "Minus 3", "Lose 3 kg from your start weight.", "Progress", 140, "Trophy"],
  ["WEIGHT_LOSS_5KG", "Minus 5", "Lose 5 kg from your start weight.", "Progress", 220, "Trophy"],
  ["WEIGHT_LOSS_10KG", "Double Digits", "Lose 10 kg from your start weight.", "Progress", 350, "Crown"],
  ["WEIGHT_LOSS_15KG", "Transformation", "Lose 15 kg from your start weight.", "Progress", 500, "Crown"],
  ["GOAL_REACHED", "Goal Reached", "Reach or beat your goal weight.", "Milestones", 600, "Medal"],
  ["LOG_NOTE_7", "Reflective", "Add notes in 7 entries.", "Habits", 130, "NotebookPen"],
  ["WAIST_LOG_7", "Measured", "Track waist in 7 entries.", "Habits", 130, "Ruler"],
  ["EXPORT_BACKUP", "Archivist", "Export your backup once.", "Exploration", 100, "Download"],
  ["IMPORT_BACKUP", "Restorer", "Import a backup once.", "Exploration", 120, "Upload"],
  ["DARK_MODE_ENABLED", "Night Shift", "Enable dark mode.", "Exploration", 80, "Moon"],
  ["ENTRY_10", "Ten Logs", "Log 10 total entries.", "Habits", 130, "CheckCheck"],
  ["ENTRY_25", "Quarter Century", "Log 25 total entries.", "Habits", 180, "CheckCheck"],
  ["ENTRY_50", "Half Hundred", "Log 50 total entries.", "Habits", 300, "CheckCheck"],
  ["ENTRY_100", "Century Logger", "Log 100 total entries.", "Habits", 500, "CheckCheck"],
  ["WEEKLY_AVG_4", "Monthly Analyst", "Complete 4 weekly averages.", "Exploration", 110, "LineChart"],
  ["WEEKLY_AVG_12", "Quarter Analyst", "Complete 12 weekly averages.", "Exploration", 240, "LineChart"],
  ["EARLY_BIRD_10", "Morning Meter", "Create 10 entries before 9am.", "Habits", 140, "Sun"],
  ["NO_MISS_30", "Zero Miss Month", "No skipped days for 30 days.", "Consistency", 280, "ShieldCheck"],
  ["NOTE_25", "Journal Habit", "Add 25 notes.", "Habits", 220, "NotebookPen"],
  ["WAIST_25", "Tape Master", "Add 25 waist measurements.", "Habits", 220, "Ruler"],
  ["LOSS_RATE_STEADY", "Steady Cutter", "Keep a stable downward trend.", "Progress", 260, "TrendingDown"],
  ["PLATEAU_BREAKER", "Plateau Breaker", "Drop below a 14-day plateau range.", "Progress", 260, "Mountain"],
  ["RETURN_AFTER_BREAK", "Comeback", "Log after a break of 7+ days.", "Consistency", 130, "RotateCw"],
  ["TWO_WEEKS_NOTES", "Mindful Fortnight", "Write notes 14 days in a row.", "Habits", 220, "NotebookPen"],
  ["FIVE_WEEK_STREAK", "Five Week Flow", "Maintain 35-day streak.", "Consistency", 320, "Flame"],
  ["BMI_UNDER_30", "Health Shift", "Reach estimated BMI under 30.", "Milestones", 300, "Heart"],
  ["BMI_UNDER_25", "Prime Zone", "Reach estimated BMI under 25.", "Milestones", 450, "Heart"],
  ["THEME_UNLOCK_6", "Style Evolved", "Reach level 6 and unlock new themes.", "Milestones", 180, "Palette"],
  ["THEME_UNLOCK_10", "Elite Aesthetic", "Reach level 10 and unlock all themes.", "Milestones", 350, "Palette"],
  ["TITLE_EQUIPPED", "Identity", "Equip your first title.", "Exploration", 90, "Badge"],
  ["DASHBOARD_30", "Daily Commander", "Open dashboard on 30 separate days.", "Habits", 220, "LayoutDashboard"]
] as const;

async function main() {
  for (const [key, title, description, category, xp_reward, icon] of achievements) {
    await prisma.achievement.upsert({
      where: { key },
      update: { title, description, category, xp_reward, icon },
      create: { key, title, description, category, xp_reward, icon }
    });
  }

  console.log(`Seeded ${achievements.length} achievements.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
