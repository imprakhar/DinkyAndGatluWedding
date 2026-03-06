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
import { FestiveOverlay } from "@/components/layout/festive-overlay";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LOGIN_PATH } from "@/lib/auth";

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dinky and Gatlu Wedding",
    subtitle: "Track guests, budget, rooms, and rituals in one place.",
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
  const isLoginPage = pathname === LOGIN_PATH;

  const copy = useMemo(() => {
    const matched = Object.entries(pageCopy).find(([key]) => pathname.startsWith(key));
    return (
      matched?.[1] ?? {
        title: "Dinky and Gatlu Wedding",
        subtitle: "Organize every detail with Dinky and Gatlu planning modes.",
      }
    );
  }, [pathname]);

  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wedding-background.png')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(255,248,236,0.64),rgba(255,248,236,0.42))] dark:bg-[linear-gradient(to_bottom,rgba(27,10,8,0.72),rgba(27,10,8,0.56))]"
      />
      <FestiveOverlay />
      {isLoginPage ? (
        <main className="relative z-10">{children}</main>
      ) : (
        <div className="relative z-10 flex min-h-screen">
          <aside className="hidden w-72 border-r border-border/80 bg-card/75 p-5 backdrop-blur-xl lg:block">
            <div className="mb-8 flex items-center gap-2">
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dinky and Gatlu Wedding</p>
                <p className="text-xs text-muted-foreground">Indian Wedding Planner</p>
              </div>
            </div>
            <SidebarNav />
          </aside>

          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
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
                <p className="text-sm font-semibold">Dinky and Gatlu Wedding</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-lg [padding-top:env(safe-area-inset-top)]">
              <div className="flex flex-wrap items-center gap-3 px-3 py-3 md:px-8 md:py-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight">{copy.title}</p>
                  <p className="hidden text-xs text-muted-foreground sm:block">{copy.subtitle}</p>
                </div>

                <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                  <LogoutButton />
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
              className="flex-1 px-3 py-5 md:px-8 md:py-8"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
            >
              {children}
            </motion.main>
          </div>
        </div>
      )}
    </div>
  );
}
