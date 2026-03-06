import {
  DoorClosed,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Settings,
  Sparkles,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guests", label: "Guest List", icon: ListChecks },
  { href: "/rooms", label: "Rooms", icon: DoorClosed },
  { href: "/budget", label: "Budget Planner", icon: PiggyBank },
  { href: "/inspiration", label: "Inspiration Board", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
