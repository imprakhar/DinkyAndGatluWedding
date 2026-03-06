import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OwnerType } from "@/types";

type OwnerMode = Exclude<OwnerType, "shared">;

type OwnerJournal = {
  notes: string;
  ideas: string;
};

type PlannerState = {
  ownerView: OwnerMode;
  journal: Record<OwnerMode, OwnerJournal>;
  setOwnerView: (mode: OwnerMode) => void;
  updateJournal: (mode: OwnerMode, payload: Partial<OwnerJournal>) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      ownerView: "bride",
      journal: {
        bride: { notes: "", ideas: "" },
        groom: { notes: "", ideas: "" },
      },
      setOwnerView: (ownerView) => set({ ownerView }),
      updateJournal: (mode, payload) =>
        set((state) => ({
          journal: {
            ...state.journal,
            [mode]: {
              ...state.journal[mode],
              ...payload,
            },
          },
        })),
    }),
    {
      name: "wedding-planner-mode",
    },
  ),
);
