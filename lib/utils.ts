import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function normalizeUnit(unit: string): "KG" | "LB" {
  return unit === "LB" ? "LB" : "KG";
}

export function formatWeight(kg: number, unit: "KG" | "LB" | string) {
  if (normalizeUnit(unit) === "KG") return `${kg.toFixed(1)} kg`;
  return `${(kg * 2.2046226218).toFixed(1)} lb`;
}

export function toKg(value: number, unit: "KG" | "LB" | string) {
  return normalizeUnit(unit) === "KG" ? value : value / 2.2046226218;
}

export function formatDate(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
