import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2).max(50),
  height_cm: z.coerce.number().min(90).max(250),
  start_weight_kg: z.coerce.number().min(25).max(400),
  goal_weight_kg: z.coerce.number().min(25).max(400),
  unit_pref: z.enum(["KG", "LB"]),
  sex: z.string().max(20).optional(),
  date_of_birth: z.string().optional()
});

export const entrySchema = z.object({
  date: z.string().min(1),
  weight: z.coerce.number().min(20).max(400),
  waist: z.coerce.number().min(30).max(300).optional().nullable(),
  note: z.string().max(400).optional().nullable(),
  overwrite: z.boolean().optional()
});

export const profileUpdateSchema = z.object({
  height_cm: z.coerce.number().min(90).max(250).optional(),
  goal_weight_kg: z.coerce.number().min(25).max(400).optional(),
  unit_pref: z.enum(["KG", "LB"]).optional(),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  accent_theme: z.string().optional(),
  title: z.string().optional(),
  pin: z.string().min(4).max(12).optional().nullable()
});
