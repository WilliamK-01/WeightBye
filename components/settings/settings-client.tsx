"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { TITLE_UNLOCKS, THEME_UNLOCK_LEVELS } from "@/lib/unlocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  profile: {
    height_cm: number;
    goal_weight_kg: number;
    unit_pref: string;
    accent_theme: string;
    title: string;
  };
  level: number;
};

export function SettingsClient({ profile, level }: Props) {
  const { setTheme, theme } = useTheme();
  const [height, setHeight] = useState(String(profile.height_cm));
  const [goal, setGoal] = useState(String(profile.goal_weight_kg));
  const [unit, setUnit] = useState<"KG" | "LB">(profile.unit_pref === "LB" ? "LB" : "KG");
  const [accent, setAccent] = useState(profile.accent_theme);
  const [title, setTitle] = useState(profile.title);
  const [pin, setPin] = useState("");

  const unlockedThemes = Object.entries(THEME_UNLOCK_LEVELS)
    .filter(([, required]) => level >= required)
    .map(([key]) => key);
  const unlockedTitles = TITLE_UNLOCKS.filter((item) => level >= item.level).map((item) => item.key);

  async function saveProfile() {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        height_cm: Number(height),
        goal_weight_kg: Number(goal),
        unit_pref: unit,
        theme: theme === "dark" ? "DARK" : theme === "light" ? "LIGHT" : "SYSTEM",
        accent_theme: accent,
        title,
        pin: pin || null
      })
    });
    if (!response.ok) {
      toast.error("Could not update settings");
      return;
    }

    localStorage.setItem("localweight-accent-theme", accent);
    document.documentElement.setAttribute("data-accent-theme", accent);
    toast.success("Settings saved");
  }

  async function exportData(format: "csv" | "json") {
    const response = await fetch(`/api/backup/export?format=${format}`);
    if (!response.ok) {
      toast.error("Export failed");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localweight-backup.${format === "csv" ? "csv" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export complete");
  }

  async function importBackup(file: File) {
    const text = await file.text();
    const response = await fetch("/api/backup/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text
    });

    if (!response.ok) {
      toast.error("Import failed");
      return;
    }

    toast.success("Import complete");
    window.location.reload();
  }

  async function resetAll() {
    const confirmed = window.confirm("This will permanently delete all data. Continue?");
    if (!confirmed) return;
    const response = await fetch("/api/reset", { method: "POST" });
    if (!response.ok) {
      toast.error("Reset failed");
      return;
    }
    toast.success("All data reset");
    window.location.href = "/onboarding";
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Height (cm)</Label>
            <Input value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Goal Weight (kg)</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Units</Label>
            <select
              className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white/60 px-3 text-sm dark:bg-slate-900/40"
              value={unit}
              onChange={(e) => setUnit(e.target.value as "KG" | "LB")}
            >
              <option value="KG">Kilograms</option>
              <option value="LB">Pounds</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Title</Label>
            <select
              className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white/60 px-3 text-sm dark:bg-slate-900/40"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            >
              {TITLE_UNLOCKS.map((item) => (
                <option key={item.key} value={item.key} disabled={!unlockedTitles.includes(item.key)}>
                  {item.key} {unlockedTitles.includes(item.key) ? "" : `(lvl ${item.level})`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>App PIN (optional)</Label>
            <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="4-12 digits" type="password" />
          </div>
          <Button onClick={saveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[hsl(var(--muted))] p-3">
            <p className="text-sm">Dark Mode</p>
            <Switch checked={theme === "dark"} onCheckedChange={(value) => setTheme(value ? "dark" : "light")} />
          </div>
          <div className="space-y-1">
            <Label>Theme skin</Label>
            <select
              className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white/60 px-3 text-sm dark:bg-slate-900/40"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            >
              {Object.entries(THEME_UNLOCK_LEVELS).map(([key, required]) => (
                <option key={key} value={key} disabled={!unlockedThemes.includes(key)}>
                  {key} {unlockedThemes.includes(key) ? "" : `(lvl ${required})`}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => exportData("csv")}>Export CSV</Button>
          <Button variant="secondary" onClick={() => exportData("json")}>Export JSON</Button>
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))]">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) importBackup(e.target.files[0]);
              }}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={resetAll}>Reset All Data</Button>
        </CardContent>
      </Card>
    </div>
  );
}
