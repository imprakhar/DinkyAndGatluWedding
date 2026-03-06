"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_AUTH_REDIRECT, type AuthRole } from "@/lib/auth";
import { usePlannerStore } from "@/store/use-planner-store";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setOwnerView = usePlannerStore((state) => state.setOwnerView);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        toast.error(payload.message ?? "Login failed");
        return;
      }

      const payload = (await response.json()) as { role: AuthRole };
      setOwnerView(payload.role);
      toast.success("Login successful");
      router.push(DEFAULT_AUTH_REDIRECT);
      router.refresh();
    } catch {
      toast.error("Unable to login. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-12">
      <Card className="w-full bg-card/90 backdrop-blur-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle className="font-[var(--font-display)] text-3xl">Dinky and Gatlu Wedding</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your wedding planner workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input id="username" className="pl-9" {...form.register("username")} />
              </div>
              <p className="text-xs text-red-600">{form.formState.errors.username?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              <p className="text-xs text-red-600">{form.formState.errors.password?.message}</p>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
