export const DAILY_WEIGH_IN_XP = 10;
export const NOTE_XP = 5;
export const WAIST_XP = 5;

export function xpFromEntry(entry: { note?: string | null; waist_cm?: number | null }) {
  let xp = DAILY_WEIGH_IN_XP;
  if (entry.note && entry.note.trim().length > 0) xp += NOTE_XP;
  if (typeof entry.waist_cm === "number") xp += WAIST_XP;
  return xp;
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 150)) + 1;
}

export function xpForLevel(level: number) {
  return Math.max(0, Math.floor(150 * Math.pow(level - 1, 2)));
}

export function xpForNextLevel(level: number) {
  return Math.floor(150 * Math.pow(level, 2));
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const currentFloor = xpForLevel(level);
  const nextFloor = xpForNextLevel(level);
  const inLevel = xp - currentFloor;
  const needed = nextFloor - currentFloor;

  return {
    level,
    inLevel,
    needed,
    percent: needed === 0 ? 100 : Math.min(100, Math.round((inLevel / needed) * 100)),
    toNext: Math.max(0, nextFloor - xp)
  };
}
