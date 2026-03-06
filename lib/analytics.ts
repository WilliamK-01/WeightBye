import { addDays, differenceInCalendarDays, formatISO, startOfWeek } from "date-fns";

export type EntryPoint = { date: Date; weight_kg: number; waist_cm?: number | null; note?: string | null };

export function movingAverage7(entries: EntryPoint[]) {
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  return sorted.map((entry, index) => {
    const start = Math.max(0, index - 6);
    const window = sorted.slice(start, index + 1);
    const avg = window.reduce((sum, e) => sum + e.weight_kg, 0) / window.length;
    return { date: entry.date, value: avg };
  });
}

export function weeklyAverages(entries: EntryPoint[]) {
  const map = new Map<string, { sum: number; count: number; start: Date }>();
  for (const entry of entries) {
    const ws = startOfWeek(entry.date, { weekStartsOn: 1 });
    const key = formatISO(ws, { representation: "date" });
    const current = map.get(key) ?? { sum: 0, count: 0, start: ws };
    current.sum += entry.weight_kg;
    current.count += 1;
    map.set(key, current);
  }

  return Array.from(map.values())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((item) => ({ start: item.start, average: item.sum / item.count }));
}

export function calculateStreak(entries: EntryPoint[]) {
  if (!entries.length) return 0;
  const sortedDates = [...new Set(entries.map((e) => formatISO(e.date, { representation: "date" })))].sort();
  let streak = 1;

  for (let i = sortedDates.length - 1; i > 0; i -= 1) {
    const current = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    if (differenceInCalendarDays(current, prev) === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  const latest = new Date(sortedDates[sortedDates.length - 1]);
  const gap = differenceInCalendarDays(new Date(), latest);
  if (gap > 1) return 0;
  return streak;
}

export function detectTrend(entries: EntryPoint[]) {
  if (entries.length < 5) return "Not enough data";
  const recent = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-14);
  const slope = linearRegression(recent).slope;
  if (slope < -0.03) return "Downtrend";
  if (slope > 0.03) return "Uptrend";
  return "Stable";
}

export function projectGoalDate(entries: EntryPoint[], goalWeightKg: number) {
  if (entries.length < 6) return null;
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const reg = linearRegression(sorted);
  if (reg.slope >= 0) return null;

  const x = (goalWeightKg - reg.intercept) / reg.slope;
  if (!Number.isFinite(x) || x < 0) return null;
  const firstDate = sorted[0].date;
  return addDays(firstDate, Math.round(x));
}

export function detectPlateau(entries: EntryPoint[]) {
  if (entries.length < 14) return false;
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const recent = sorted.slice(-14);
  const min = Math.min(...recent.map((e) => e.weight_kg));
  return recent[recent.length - 1].weight_kg <= min + 0.2;
}

function linearRegression(entries: EntryPoint[]) {
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const x = sorted.map((entry) => differenceInCalendarDays(entry.date, sorted[0].date));
  const y = sorted.map((entry) => entry.weight_kg);
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, idx) => acc + val * y[idx], 0);
  const sumXX = x.reduce((acc, val) => acc + val * val, 0);

  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
