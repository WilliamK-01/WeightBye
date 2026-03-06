import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { onboardingSchema, profileUpdateSchema } from "@/lib/validations";
import { unlockAchievementByKey } from "@/lib/achievements";

export async function GET() {
  const profile = await db.userProfile.findFirst();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exists = await db.userProfile.findFirst();
  if (exists) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  const profile = await db.userProfile.create({
    data: {
      ...parsed.data,
      date_of_birth: parsed.data.date_of_birth ? new Date(parsed.data.date_of_birth) : null
    }
  });

  await db.userProgress.create({
    data: {
      user_id: profile.id,
      xp_total: 0,
      level: 1
    }
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const profile = await db.userProfile.findFirst();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };

  if (typeof data.pin === "string") {
    updateData.pin_hash = createHash("sha256").update(data.pin).digest("hex");
    delete updateData.pin;
  }

  if (data.pin === null) {
    updateData.pin_hash = null;
    delete updateData.pin;
  }

  const updated = await db.userProfile.update({ where: { id: profile.id }, data: updateData });

  if (updated.theme === "DARK") {
    await unlockAchievementByKey(updated.id, "DARK_MODE_ENABLED");
  }

  if (updated.title !== "Awakening") {
    await unlockAchievementByKey(updated.id, "TITLE_EQUIPPED");
  }

  return NextResponse.json({ profile: updated });
}
