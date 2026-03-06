"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/achievements", label: "Achievements" },
  { href: "/settings", label: "Settings" }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "rounded-full border border-white/40 px-4 py-2 text-sm transition",
            pathname === route.href
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "bg-white/40 hover:bg-white/70 dark:bg-slate-900/40 dark:hover:bg-slate-800/70"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
