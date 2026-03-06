"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Guest, Room } from "@/types";

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  group_name: z.string().optional(),
  phone: z.string().optional(),
  guest_count: z.coerce.number().min(1, "Guest count must be at least 1"),
  room_id: z.string().optional(),
  stay_type: z.enum(["primary", "secondary"]),
  has_vehicle: z.boolean(),
  arrival_confirmed: z.boolean(),
  notes: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestSchema>;

const emptyValues: GuestFormValues = {
  name: "",
  group_name: "",
  phone: "",
  guest_count: 1,
  room_id: "",
  stay_type: "primary",
  has_vehicle: false,
  arrival_confirmed: false,
  notes: "",
};

function toCsvValue(value: string | number | boolean | null) {
  if (value === null) return "";
  const text = String(value);
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export default function GuestsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [search, setSearch] = useState("");
  const [confirmedFilter, setConfirmedFilter] = useState<"all" | "yes" | "no">("all");
  const [vehicleFilter, setVehicleFilter] = useState<"all" | "yes" | "no">("all");
  const [stayFilter, setStayFilter] = useState<"all" | "primary" | "secondary">("all");
  const [roomFilter, setRoomFilter] = useState<"all" | "assigned" | "unassigned">("all");

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: emptyValues,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [guestData, roomData] = await Promise.all([api.getGuests(), api.getRooms()]);
      setGuests(guestData);
      setRooms(roomData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roomMap = useMemo(
    () => new Map(rooms.map((room) => [room.id, room.room_name])),
    [rooms],
  );

  const filteredGuests = useMemo(() => {
    const token = search.trim().toLowerCase();

    return guests.filter((guest) => {
      if (token) {
        const isMatch =
          guest.name.toLowerCase().includes(token) ||
          (guest.group_name ?? "").toLowerCase().includes(token) ||
          (guest.phone ?? "").toLowerCase().includes(token);
        if (!isMatch) return false;
      }

      if (confirmedFilter === "yes" && !guest.arrival_confirmed) return false;
      if (confirmedFilter === "no" && guest.arrival_confirmed) return false;
      if (vehicleFilter === "yes" && !guest.has_vehicle) return false;
      if (vehicleFilter === "no" && guest.has_vehicle) return false;
      if (stayFilter !== "all" && guest.stay_type !== stayFilter) return false;
      if (roomFilter === "assigned" && guest.room_id === null) return false;
      if (roomFilter === "unassigned" && guest.room_id !== null) return false;

      return true;
    });
  }, [guests, search, confirmedFilter, vehicleFilter, stayFilter, roomFilter]);

  const stats = useMemo(() => {
    const totalGuests = guests.reduce((sum, guest) => sum + guest.guest_count, 0);
    const confirmedGuests = guests
      .filter((guest) => guest.arrival_confirmed)
      .reduce((sum, guest) => sum + guest.guest_count, 0);
    const roomsNeeded = new Set(guests.map((guest) => guest.room_id).filter(Boolean)).size;
    const vehiclesCount = guests.filter((guest) => guest.has_vehicle).length;

    return { totalGuests, confirmedGuests, roomsNeeded, vehiclesCount };
  }, [guests]);

  const startEdit = (guest: Guest) => {
    setEditingGuest(guest);
    form.reset({
      name: guest.name,
      group_name: guest.group_name ?? "",
      phone: guest.phone ?? "",
      guest_count: guest.guest_count,
      room_id: guest.room_id ? String(guest.room_id) : "",
      stay_type: guest.stay_type,
      has_vehicle: guest.has_vehicle,
      arrival_confirmed: guest.arrival_confirmed,
      notes: guest.notes ?? "",
    });
  };

  const resetForm = () => {
    setEditingGuest(null);
    form.reset(emptyValues);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      group_name: values.group_name?.trim() || null,
      phone: values.phone?.trim() || null,
      guest_count: values.guest_count,
      room_id: values.room_id ? Number(values.room_id) : null,
      stay_type: values.stay_type,
      has_vehicle: values.has_vehicle,
      arrival_confirmed: values.arrival_confirmed,
      notes: values.notes?.trim() || null,
    };

    try {
      setSubmitting(true);
      if (editingGuest) {
        await api.updateGuest(editingGuest.id, payload);
        toast.success("Guest updated");
      } else {
        await api.createGuest(payload);
        toast.success("Guest added");
      }
      resetForm();
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save guest");
    } finally {
      setSubmitting(false);
    }
  });

  const onDelete = async (guestId: number) => {
    try {
      await api.deleteGuest(guestId);
      toast.success("Guest removed");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove guest");
    }
  };

  const exportCsv = () => {
    const headers = [
      "Name",
      "Family/Group",
      "Phone",
      "Guest Count",
      "Assigned Room",
      "Stay Type",
      "Has Vehicle",
      "Arrival Confirmed",
      "Notes",
    ];

    const rows = filteredGuests.map((guest) => [
      guest.name,
      guest.group_name,
      guest.phone,
      guest.guest_count,
      guest.room_id ? roomMap.get(guest.room_id) ?? "" : "",
      guest.stay_type,
      guest.has_vehicle,
      guest.arrival_confirmed,
      guest.notes,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => toCsvValue(value)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-guests.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Guest list exported to CSV");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Guest List Management"
        description="Track RSVPs, rooms, vehicles, and stay plans for every guest group."
        action={
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Guests</p>
            <p className="text-2xl font-semibold">{stats.totalGuests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Confirmed Guests</p>
            <p className="text-2xl font-semibold">{stats.confirmedGuests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rooms Needed</p>
            <p className="text-2xl font-semibold">{stats.roomsNeeded}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Vehicles Count</p>
            <p className="text-2xl font-semibold">{stats.vehiclesCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">
            {editingGuest ? "Edit Guest" : "Add Guest"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              <p className="text-xs text-red-600">{form.formState.errors.name?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_name">Family/Group Name</Label>
              <Input id="group_name" {...form.register("group_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_count">Number of Guests</Label>
              <Input id="guest_count" type="number" min={1} {...form.register("guest_count")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_id">Assigned Room</Label>
              <Select id="room_id" {...form.register("room_id")}>
                <option value="">No room assigned</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_name} ({room.occupancy}/{room.capacity})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stay_type">Stay Type</Label>
              <Select id="stay_type" {...form.register("stay_type")}>
                <option value="primary">Primary Stay</option>
                <option value="secondary">Secondary Stay</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...form.register("notes")} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox {...form.register("has_vehicle")} />
              Has own vehicle
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox {...form.register("arrival_confirmed")} />
              Arrival confirmed
            </label>

            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {editingGuest ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Guest
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guest
                  </>
                )}
              </Button>
              {editingGuest ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Search name, group, phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={confirmedFilter}
            onChange={(event) => setConfirmedFilter(event.target.value as typeof confirmedFilter)}
          >
            <option value="all">All Confirmation</option>
            <option value="yes">Confirmed</option>
            <option value="no">Not Confirmed</option>
          </Select>
          <Select
            value={vehicleFilter}
            onChange={(event) => setVehicleFilter(event.target.value as typeof vehicleFilter)}
          >
            <option value="all">All Vehicle Status</option>
            <option value="yes">Has Vehicle</option>
            <option value="no">No Vehicle</option>
          </Select>
          <Select
            value={stayFilter}
            onChange={(event) => setStayFilter(event.target.value as typeof stayFilter)}
          >
            <option value="all">All Stay Types</option>
            <option value="primary">Primary Stay</option>
            <option value="secondary">Secondary Stay</option>
          </Select>
          <Select
            value={roomFilter}
            onChange={(event) => setRoomFilter(event.target.value as typeof roomFilter)}
          >
            <option value="all">All Room Assignment</option>
            <option value="assigned">Room Assigned</option>
            <option value="unassigned">Room Unassigned</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">Guests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingState label="Loading guests..." /> : null}

          {!loading ? (
            <>
              <div className="space-y-3 md:hidden">
                {filteredGuests.map((guest) => (
                  <div key={guest.id} className="rounded-lg border border-border/70 bg-background/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {guest.group_name || "No group"} · {guest.guest_count} guest(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(guest)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(guest.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        Room: {guest.room_id ? roomMap.get(guest.room_id) ?? "-" : "Unassigned"}
                      </Badge>
                      <Badge variant="secondary">
                        Stay: {guest.stay_type === "primary" ? "Primary" : "Secondary"}
                      </Badge>
                      <Badge variant={guest.has_vehicle ? "success" : "outline"}>
                        Vehicle: {guest.has_vehicle ? "Yes" : "No"}
                      </Badge>
                      <Badge variant={guest.arrival_confirmed ? "success" : "warning"}>
                        Arrival: {guest.arrival_confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Group</th>
                      <th className="pb-3">Guests</th>
                      <th className="pb-3">Room</th>
                      <th className="pb-3">Stay</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Arrival</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="border-b border-border/50">
                        <td className="py-3 font-medium">{guest.name}</td>
                        <td className="py-3">{guest.group_name || "-"}</td>
                        <td className="py-3">{guest.guest_count}</td>
                        <td className="py-3">
                          {guest.room_id ? roomMap.get(guest.room_id) ?? "-" : "Unassigned"}
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">
                            {guest.stay_type === "primary" ? "Primary" : "Secondary"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={guest.has_vehicle ? "success" : "outline"}>
                            {guest.has_vehicle ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={guest.arrival_confirmed ? "success" : "warning"}>
                            {guest.arrival_confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(guest)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDelete(guest.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!filteredGuests.length ? (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <p>No guests match the selected filters.</p>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
