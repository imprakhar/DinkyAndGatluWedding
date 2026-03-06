from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class RoomBase(BaseModel):
    room_name: str = Field(min_length=1, max_length=120)
    capacity: int = Field(ge=1, le=100)


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_name: str | None = Field(default=None, min_length=1, max_length=120)
    capacity: int | None = Field(default=None, ge=1, le=100)


class RoomRead(RoomBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guests_assigned: int = 0
    occupancy: int = 0


class GuestBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    group_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    guest_count: int = Field(default=1, ge=1, le=50)
    room_id: int | None = None
    stay_type: Literal["primary", "secondary"] = Field(default="primary")
    has_vehicle: bool = False
    arrival_confirmed: bool = False
    notes: str | None = None


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    group_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    guest_count: int | None = Field(default=None, ge=1, le=50)
    room_id: int | None = None
    stay_type: Literal["primary", "secondary"] | None = None
    has_vehicle: bool | None = None
    arrival_confirmed: bool | None = None
    notes: str | None = None


class GuestRead(GuestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class BudgetItemBase(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    estimated_cost: float = Field(default=0, ge=0)
    actual_cost: float = Field(default=0, ge=0)


class BudgetItemCreate(BudgetItemBase):
    pass


class BudgetItemUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=1, max_length=80)
    estimated_cost: float | None = Field(default=None, ge=0)
    actual_cost: float | None = Field(default=None, ge=0)


class BudgetItemRead(BudgetItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class InspirationLinkBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    url: HttpUrl
    category: str = Field(min_length=1, max_length=100)
    notes: str | None = None
    owner_type: Literal["bride", "groom", "shared"] = Field(default="shared")


class InspirationLinkCreate(InspirationLinkBase):
    pass


class InspirationLinkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    url: str
    category: str
    notes: str | None
    owner_type: str
