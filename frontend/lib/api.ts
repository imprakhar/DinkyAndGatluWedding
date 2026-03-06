import type {
  BudgetItem,
  Guest,
  GuestFilters,
  InspirationLink,
  Room,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload?.detail) {
        message = payload.detail;
      }
    } catch {
      // no-op
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export const api = {
  getGuests: (filters?: GuestFilters) =>
    request<Guest[]>(
      `/guests${
        filters
          ? buildQuery({
              search: filters.search,
              confirmed: filters.confirmed,
              vehicle: filters.vehicle,
              stay_type: filters.stay_type,
              room_assigned: filters.room_assigned,
            })
          : ""
      }`,
    ),
  createGuest: (payload: Omit<Guest, "id">) =>
    request<Guest>("/guests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateGuest: (id: number, payload: Partial<Omit<Guest, "id">>) =>
    request<Guest>(`/guests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteGuest: (id: number) =>
    request<void>(`/guests/${id}`, {
      method: "DELETE",
    }),

  getRooms: () => request<Room[]>("/rooms"),
  createRoom: (payload: Pick<Room, "room_name" | "capacity">) =>
    request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRoom: (id: number, payload: Partial<Pick<Room, "room_name" | "capacity">>) =>
    request<Room>(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  assignGuestToRoom: (roomId: number, guestId: number) =>
    request<Room>(`/rooms/${roomId}/assign/${guestId}`, {
      method: "POST",
    }),

  getBudget: () => request<BudgetItem[]>("/budget"),
  createBudgetItem: (payload: Omit<BudgetItem, "id">) =>
    request<BudgetItem>("/budget", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateBudgetItem: (id: number, payload: Partial<Omit<BudgetItem, "id">>) =>
    request<BudgetItem>(`/budget/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteBudgetItem: (id: number) =>
    request<void>(`/budget/${id}`, {
      method: "DELETE",
    }),

  getLinks: (filters?: { owner_type?: string; category?: string; search?: string }) =>
    request<InspirationLink[]>(
      `/links${
        filters
          ? buildQuery({
              owner_type: filters.owner_type,
              category: filters.category,
              search: filters.search,
            })
          : ""
      }`,
    ),
  createLink: (payload: Omit<InspirationLink, "id">) =>
    request<InspirationLink>("/links", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteLink: (id: number) =>
    request<void>(`/links/${id}`, {
      method: "DELETE",
    }),
};

export { ApiError };
