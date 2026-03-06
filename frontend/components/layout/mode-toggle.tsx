"use client";

import { usePlannerStore } from "@/store/use-planner-store";
import { cn } from "@/lib/utils";

const modes = [
  { label: "Bride", value: "bride" as const },
  { label: "Groom", value: "groom" as const },
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
          onClick={() => setOwnerView(mode.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition",
            ownerView === mode.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
