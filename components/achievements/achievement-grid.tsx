"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Achievement = {
  id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  unlocked: boolean;
  icon: string;
  progress: { current: number; target: number };
};

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {achievements.map((achievement, idx) => {
        const percent = Math.min(100, Math.round((achievement.progress.current / achievement.progress.target) * 100));

        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className={achievement.unlocked ? "ring-2 ring-emerald-400/60" : "opacity-85"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>{achievement.title}</span>
                  <Trophy className={`h-4 w-4 ${achievement.unlocked ? "text-emerald-500" : "text-slate-400"}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{achievement.description}</p>
                <div className="flex items-center justify-between">
                  <Badge>{achievement.category}</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">+{achievement.xp_reward} XP</Badge>
                </div>
                <Progress value={percent} />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {achievement.progress.current}/{achievement.progress.target}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
