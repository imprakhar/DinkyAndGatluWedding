import type { OwnerType } from "@/types";

export const ownerLabels: Record<OwnerType, { short: string; full: string }> = {
  bride: { short: "Dinky", full: "Dinky (Bride)" },
  groom: { short: "Gatlu", full: "Gatlu (Groom)" },
  shared: { short: "Shared", full: "Shared" },
};

export function ownerShortLabel(owner: OwnerType) {
  return ownerLabels[owner].short;
}

export function ownerFullLabel(owner: OwnerType) {
  return ownerLabels[owner].full;
}
