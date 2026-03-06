"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, Car, Users } from "lucide-react";

import { GuestConfirmationChart } from "@/components/charts/guest-confirmation-chart";
import { BudgetBarChart } from "@/components/charts/budget-bar-chart";
import { SectionHeader } from "@/components/layout/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { currency } from "@/lib/utils";
import { usePlannerStore } from "@/store/use-planner-store";
import type { BudgetItem, Guest, InspirationLink, Room } from "@/types";

export default function DashboardPage() {
  const ownerView = usePlannerStore((state) => state.ownerView);
  const ownerJournal = usePlannerStore((state) => state.journal[state.ownerView]);
  const updateJournal = usePlannerStore((state) => state.updateJournal);

  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [links, setLinks] = useState<InspirationLink[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [guestData, roomData, budgetData, linkData] = await Promise.all([
          api.getGuests(),
          api.getRooms(),
          api.getBudget(),
          api.getLinks(),
        ]);
        setGuests(guestData);
        setRooms(roomData);
        setBudget(budgetData);
        setLinks(linkData);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const metrics = useMemo(() => {
    const totalGuests = guests.reduce((sum, guest) => sum + guest.guest_count, 0);
    const confirmedGuests = guests
      .filter((guest) => guest.arrival_confirmed)
      .reduce((sum, guest) => sum + guest.guest_count, 0);
    const vehiclesCount = guests.filter((guest) => guest.has_vehicle).length;
    const roomsInUse = rooms.filter((room) => room.occupancy > 0).length;

    const estimated = budget.reduce((sum, item) => sum + item.estimated_cost, 0);
    const spent = budget.reduce((sum, item) => sum + item.actual_cost, 0);
    const remaining = estimated - spent;

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests: Math.max(totalGuests - confirmedGuests, 0),
      vehiclesCount,
      roomsInUse,
      estimated,
      spent,
      remaining,
    };
  }, [guests, rooms, budget]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Overview"
        description="Monitor RSVP progress, room occupancy, and budget health at a glance."
      />

      {loading ? <LoadingState label="Loading dashboard data..." /> : null}

      {!loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Guests"
              value={String(metrics.totalGuests)}
              hint="Includes family/group counts"
              icon={Users}
            />
            <StatCard
              label="Confirmed Guests"
              value={String(metrics.confirmedGuests)}
              hint={`${metrics.pendingGuests} pending`}
              icon={Users}
            />
            <StatCard
              label="Rooms Needed"
              value={String(metrics.roomsInUse)}
              hint={`${rooms.length} total rooms`}
              icon={BedDouble}
            />
            <StatCard
              label="Vehicles Count"
              value={String(metrics.vehiclesCount)}
              hint="Guests with own transport"
              icon={Car}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">RSVP Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <GuestConfirmationChart
                  confirmed={metrics.confirmedGuests}
                  pending={metrics.pendingGuests}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">Budget Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetBarChart data={budget} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">Budget Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Budget</span>
                  <span className="font-semibold">{currency(metrics.estimated)}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-semibold">{currency(metrics.spent)}</span>
                </p>
                <p className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                  <span>{metrics.remaining >= 0 ? "Remaining" : "Overspend"}</span>
                  <span className="font-semibold">
                    {metrics.remaining >= 0
                      ? currency(metrics.remaining)
                      : currency(Math.abs(metrics.remaining))}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">
                  {ownerView === "bride" ? "Bride Notes & Ideas" : "Groom Notes & Ideas"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <Textarea
                    value={ownerJournal.notes}
                    onChange={(event) =>
                      updateJournal(ownerView, { notes: event.target.value })
                    }
                    placeholder="Track rituals, vendors, and tasks for this side."
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Ideas
                  </p>
                  <Textarea
                    value={ownerJournal.ideas}
                    onChange={(event) =>
                      updateJournal(ownerView, { ideas: event.target.value })
                    }
                    placeholder="Save styling ideas, music themes, or ceremony moments."
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Saved per mode in your browser.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">Inspiration Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {links.slice(0, 4).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border/80 bg-background/80 p-3 transition hover:border-primary/70"
                    >
                      <p className="line-clamp-1 text-sm font-semibold">{link.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{link.category}</p>
                    </a>
                  ))}
                  {!links.length ? (
                    <p className="text-sm text-muted-foreground">
                      No inspirations saved yet. Add references from Instagram or Pinterest.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
