"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { ModeToggle } from "@/components/layout/mode-toggle";
import { navItems } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Wedding Command Center",
    subtitle: "Track guests, budget, rooms, and shared planning in one place.",
  },
  "/guests": {
    title: "Guest List",
    subtitle: "Manage confirmations, transport, and accommodation details.",
  },
  "/rooms": {
    title: "Rooms",
    subtitle: "Plan room allocation and stay occupancy with confidence.",
  },
  "/budget": {
    title: "Budget Planner",
    subtitle: "Compare estimates against actual spend to avoid surprises.",
  },
  "/inspiration": {
    title: "Inspiration Board",
    subtitle: "Collect references from Instagram, Pinterest, and beyond.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Adjust planner preferences and environment details.",
  },
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const copy = useMemo(() => {
    const matched = Object.entries(pageCopy).find(([key]) => pathname.startsWith(key));
    return (
      matched?.[1] ?? {
        title: "Wedding Planner",
        subtitle: "Organize every detail with Bride and Groom planning modes.",
      }
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background bg-wedding-glow">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-border/80 bg-card/75 p-5 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2 text-primary">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">EverAfter Planner</p>
              <p className="text-xs text-muted-foreground">Wedding OS</p>
            </div>
          </div>
          <SidebarNav />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-5 shadow-xl transition-transform lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <Heart className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">EverAfter Planner</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-lg">
            <div className="flex flex-wrap items-center gap-4 px-4 py-4 md:px-8">
              <Button
                size="icon"
                variant="outline"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="min-w-[220px] flex-1">
                <p className="font-semibold tracking-tight">{copy.title}</p>
                <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ModeToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="flex-1 px-4 py-6 md:px-8 md:py-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
