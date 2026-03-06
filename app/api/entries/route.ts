import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { entrySchema } from "@/lib/validations";
import { syncGamification } from "@/lib/achievements";

export async function GET() {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ entries: [] });

  const entries = await db.weightEntry.findMany({ where: { user_id: profile.id }, orderBy: { date: "desc" } });
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

  const body = await request.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { date, weight, waist, note, overwrite } = parsed.data;
  const normalizedDate = startOfDay(new Date(date));

  const existing = await db.weightEntry.findUnique({
    where: { user_id_date: { user_id: profile.id, date: normalizedDate } }
  });

  if (existing && !overwrite) {
    return NextResponse.json({ error: "Entry exists" }, { status: 409 });
  }

  const entry = existing
    ? await db.weightEntry.update({
        where: { id: existing.id },
        data: {
          weight_kg: weight,
          waist_cm: waist ?? null,
          note: note || null
        }
      })
    : await db.weightEntry.create({
        data: {
          user_id: profile.id,
          date: normalizedDate,
          weight_kg: weight,
          waist_cm: waist ?? null,
          note: note || null
        }
      });

  const sync = await syncGamification(profile.id);

  return NextResponse.json({
    entry,
    newlyUnlocked: sync.toUnlock.map((item: { title: string }) => item.title),
    levelUp: sync.levelUp,
    level: sync.level
  });
}
