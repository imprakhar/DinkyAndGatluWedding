"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LOGIN_PATH } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(LOGIN_PATH);
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLogout}
      disabled={loading}
      aria-label="Logout"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Signing out..." : "Logout"}
    </Button>
  );
}
