"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BedDouble, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Guest, Room } from "@/types";

const roomSchema = z.object({
  room_name: z.string().min(1, "Room name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const defaults: RoomFormValues = {
  room_name: "",
  capacity: 2,
};

export default function RoomsPage() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string>>({});

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: defaults,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomData, guestData] = await Promise.all([api.getRooms(), api.getGuests()]);
      setRooms(roomData);
      setGuests(guestData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unassignedGuests = useMemo(
    () => guests.filter((guest) => guest.room_id === null),
    [guests],
  );

  const startEdit = (room: Room) => {
    setEditingRoom(room);
    form.reset({ room_name: room.room_name, capacity: room.capacity });
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    form.reset(defaults);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, values);
        toast.success("Room updated");
      } else {
        await api.createRoom(values);
        toast.success("Room added");
      }
      cancelEdit();
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save room");
    }
  });

  const assignGuest = async (roomId: number) => {
    const guestId = assignments[roomId];
    if (!guestId) {
      toast.error("Select a guest to assign");
      return;
    }

    try {
      await api.assignGuestToRoom(roomId, Number(guestId));
      toast.success("Guest assigned to room");
      setAssignments((prev) => ({ ...prev, [roomId]: "" }));
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign guest");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Rooms Management"
        description="Create rooms, track occupancy, and assign guest groups by availability."
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl">
            {editingRoom ? "Edit Room" : "Add Room"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="room_name">Room Name</Label>
              <Input id="room_name" {...form.register("room_name")} />
              <p className="text-xs text-red-600">{form.formState.errors.room_name?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" min={1} {...form.register("capacity")} />
              <p className="text-xs text-red-600">{form.formState.errors.capacity?.message}</p>
            </div>

            <div className="flex items-end gap-2 md:justify-start">
              <Button type="submit">
                {editingRoom ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Room
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Room
                  </>
                )}
              </Button>
              {editingRoom ? (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? <LoadingState label="Loading rooms..." /> : null}

      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const roomGuests = guests.filter((guest) => guest.room_id === room.id);
            const occupancyPct = Math.min((room.occupancy / room.capacity) * 100, 100);

            return (
              <Card key={room.id} className="bg-card/85">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="font-[var(--font-display)] text-2xl">
                      {room.room_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {room.guests_assigned} groups · {room.occupancy}/{room.capacity} occupied
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startEdit(room)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Guests Assigned</p>
                    <div className="flex flex-wrap gap-2">
                      {roomGuests.length ? (
                        roomGuests.map((guest) => (
                          <Badge key={guest.id} variant="secondary">
                            {guest.name} ({guest.guest_count})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No guests assigned yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/70 p-3">
                    <Label htmlFor={`assign-${room.id}`}>Assign Guest to Room</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Select
                        id={`assign-${room.id}`}
                        value={assignments[room.id] ?? ""}
                        onChange={(event) =>
                          setAssignments((prev) => ({
                            ...prev,
                            [room.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select unassigned guest</option>
                        {unassignedGuests.map((guest) => (
                          <option key={guest.id} value={guest.id}>
                            {guest.name} ({guest.guest_count})
                          </option>
                        ))}
                      </Select>
                      <Button type="button" className="sm:w-auto" onClick={() => assignGuest(room.id)}>
                        Assign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!rooms.length ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
                <BedDouble className="h-4 w-4" />
                <p>No rooms created yet.</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
