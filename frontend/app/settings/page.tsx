"use client";

import { useMemo } from "react";
import { CheckCircle2, Link2, UserRound } from "lucide-react";

import { SectionHeader } from "@/components/layout/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ownerFullLabel } from "@/lib/owner-labels";
import { usePlannerStore } from "@/store/use-planner-store";

export default function SettingsPage() {
  const ownerView = usePlannerStore((state) => state.ownerView);
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  const ownerLabel = useMemo(() => ownerFullLabel(ownerView), [ownerView]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        description="Current application preferences and integration configuration."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="h-5 w-5" />
              Planner Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active profile for ideas and quick defaults.</p>
            <p className="mt-2 text-lg font-semibold">{ownerLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Link2 className="h-5 w-5" />
              Backend API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configured API endpoint</p>
            <code className="mt-2 block rounded-md bg-secondary/70 px-3 py-2 text-sm">
              {apiBase}
            </code>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5" />
              Deployment Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Frontend is optimized for Vercel deployment on free tier.</p>
            <p>Backend is optimized for Render web service with SQLite persisted disk.</p>
            <p>Set `NEXT_PUBLIC_API_BASE_URL` to your deployed FastAPI backend URL.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
