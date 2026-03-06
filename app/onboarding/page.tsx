import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await db.userProfile.findFirst();
  if (profile) redirect("/dashboard");

  return (
    <section className="space-y-6 pt-8">
      <h1 className="font-display text-3xl font-semibold">Welcome to LocalWeight</h1>
      <p className="max-w-xl text-[hsl(var(--muted-foreground))]">
        Build momentum with meaningful tracking, achievement unlocks, and local-first privacy.
      </p>
      <OnboardingForm />
    </section>
  );
}
