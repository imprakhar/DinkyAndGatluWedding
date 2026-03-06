export type OwnerType = "bride" | "groom" | "shared";

export type StayType = "primary" | "secondary";

export interface Guest {
  id: number;
  name: string;
  group_name: string | null;
  phone: string | null;
  guest_count: number;
  room_id: number | null;
  stay_type: StayType;
  has_vehicle: boolean;
  arrival_confirmed: boolean;
  notes: string | null;
}

export interface Room {
  id: number;
  room_name: string;
  capacity: number;
  guests_assigned: number;
  occupancy: number;
}

export interface BudgetItem {
  id: number;
  category: string;
  estimated_cost: number;
  actual_cost: number;
}

export interface InspirationLink {
  id: number;
  title: string;
  url: string;
  category: string;
  notes: string | null;
  owner_type: OwnerType;
}

export interface GuestFilters {
  search?: string;
  confirmed?: boolean;
  vehicle?: boolean;
  stay_type?: StayType;
  room_assigned?: boolean;
}
