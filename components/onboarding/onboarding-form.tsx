"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { onboardingSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      unit_pref: "KG"
    }
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      toast.error("Could not create profile");
      return;
    }

    toast.success("Welcome to LocalWeight");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Create your profile</CardTitle>
          <CardDescription>Set your baseline and goal to start tracking progress locally.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Alex" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input id="height_cm" type="number" step="0.1" {...register("height_cm")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_weight_kg">Start Weight</Label>
              <Input id="start_weight_kg" type="number" step="0.1" {...register("start_weight_kg")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal_weight_kg">Goal Weight</Label>
              <Input id="goal_weight_kg" type="number" step="0.1" {...register("goal_weight_kg")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_pref">Units</Label>
              <select
                id="unit_pref"
                className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white/60 px-3 text-sm dark:bg-slate-900/40"
                {...register("unit_pref")}
              >
                <option value="KG">Kilograms</option>
                <option value="LB">Pounds</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex (optional)</Label>
              <Input id="sex" placeholder="Optional" {...register("sex")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="date_of_birth">Date of Birth (optional)</Label>
              <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
            </div>
            <Button className="sm:col-span-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
