import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncGamification } from "@/lib/achievements";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

  const body = await request.json();
  const id = Number(params.id);

  const updated = await db.weightEntry.update({
    where: { id },
    data: {
      date: body.date ? startOfDay(new Date(body.date)) : undefined,
      weight_kg: typeof body.weight === "number" ? body.weight : undefined,
      waist_cm: body.waist ?? undefined,
      note: body.note ?? undefined
    }
  });

  const sync = await syncGamification(profile.id);
  return NextResponse.json({ entry: updated, level: sync.level });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const profile = await db.userProfile.findFirst();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

  await db.weightEntry.delete({ where: { id: Number(params.id) } });
  await syncGamification(profile.id);
  return NextResponse.json({ ok: true });
}
