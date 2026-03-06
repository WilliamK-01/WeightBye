import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { achievementView } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ achievements: [] });

  const achievements = await achievementView(profile.id);
  return NextResponse.json({ achievements });
}
