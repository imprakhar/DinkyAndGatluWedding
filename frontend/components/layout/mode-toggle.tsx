"use client";

import { usePlannerStore } from "@/store/use-planner-store";
import { cn } from "@/lib/utils";
import { ownerFullLabel, ownerShortLabel } from "@/lib/owner-labels";

const modes = [
  { value: "bride" as const },
  { value: "groom" as const },
];

export function ModeToggle() {
  const ownerView = usePlannerStore((state) => state.ownerView);
  const setOwnerView = usePlannerStore((state) => state.setOwnerView);

  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          title={ownerFullLabel(mode.value)}
          onClick={() => setOwnerView(mode.value)}
          className={cn(
            "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition",
            ownerView === mode.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="sm:hidden">{ownerShortLabel(mode.value)}</span>
          <span className="hidden sm:inline">{ownerFullLabel(mode.value)}</span>
        </button>
      ))}
    </div>
  );
}
