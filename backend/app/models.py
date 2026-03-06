from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)

    guests: Mapped[list["Guest"]] = relationship(
        back_populates="room", cascade="all,delete", passive_deletes=True
    )


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    group_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    room_id: Mapped[int | None] = mapped_column(
        ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True
    )
    stay_type: Mapped[str] = mapped_column(String(40), nullable=False, default="primary")
    has_vehicle: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    arrival_confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    room: Mapped[Room | None] = relationship(back_populates="guests")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    actual_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0)


class InspirationLink(Base):
    __tablename__ = "inspiration_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    url: Mapped[str] = mapped_column(String(600), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_type: Mapped[str] = mapped_column(String(20), nullable=False, default="shared")
