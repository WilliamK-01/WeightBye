import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  await db.$transaction([
    db.userAchievement.deleteMany({}),
    db.weightEntry.deleteMany({}),
    db.userProgress.deleteMany({}),
    db.userProfile.deleteMany({})
  ]);

  return NextResponse.json({ ok: true });
}
