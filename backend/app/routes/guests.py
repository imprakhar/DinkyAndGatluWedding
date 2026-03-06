from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Guest, Room
from ..schemas import GuestCreate, GuestRead, GuestUpdate

router = APIRouter(prefix="/guests", tags=["Guests"])


def _validate_room_capacity(
    db: Session,
    room_id: int,
    guest_count: int,
    exclude_guest_id: int | None = None,
) -> None:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    occupants_query = select(Guest).where(Guest.room_id == room_id)
    if exclude_guest_id is not None:
        occupants_query = occupants_query.where(Guest.id != exclude_guest_id)

    occupants = db.scalars(occupants_query).all()
    current_count = sum(guest.guest_count for guest in occupants)
    if current_count + guest_count > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Room capacity exceeded for {room.room_name}. "
                f"Capacity: {room.capacity}, occupancy after assignment: {current_count + guest_count}."
            ),
        )


@router.get("", response_model=list[GuestRead])
def get_guests(
    search: str | None = Query(default=None),
    confirmed: bool | None = Query(default=None),
    vehicle: bool | None = Query(default=None),
    stay_type: str | None = Query(default=None),
    room_assigned: bool | None = Query(default=None),
    room_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[GuestRead]:
    stmt = select(Guest)

    if search:
        token = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Guest.name.ilike(token),
                Guest.group_name.ilike(token),
                Guest.phone.ilike(token),
            )
        )
    if confirmed is not None:
        stmt = stmt.where(Guest.arrival_confirmed == confirmed)
    if vehicle is not None:
        stmt = stmt.where(Guest.has_vehicle == vehicle)
    if stay_type:
        stmt = stmt.where(Guest.stay_type == stay_type)
    if room_assigned is not None:
        if room_assigned:
            stmt = stmt.where(Guest.room_id.is_not(None))
        else:
            stmt = stmt.where(Guest.room_id.is_(None))
    if room_id is not None:
        stmt = stmt.where(Guest.room_id == room_id)

    stmt = stmt.order_by(Guest.name.asc())
    return list(db.scalars(stmt).all())


@router.post("", response_model=GuestRead, status_code=status.HTTP_201_CREATED)
def create_guest(payload: GuestCreate, db: Session = Depends(get_db)) -> GuestRead:
    if payload.room_id is not None:
        _validate_room_capacity(db, payload.room_id, payload.guest_count)

    guest = Guest(**payload.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.put("/{guest_id}", response_model=GuestRead)
def update_guest(guest_id: int, payload: GuestUpdate, db: Session = Depends(get_db)) -> GuestRead:
    guest = db.get(Guest, guest_id)
    if guest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")

    updates = payload.model_dump(exclude_unset=True)
    next_room_id = updates.get("room_id", guest.room_id)
    next_guest_count = updates.get("guest_count", guest.guest_count)

    if next_room_id is not None:
        _validate_room_capacity(
            db,
            room_id=next_room_id,
            guest_count=next_guest_count,
            exclude_guest_id=guest_id,
        )

    for key, value in updates.items():
        setattr(guest, key, value)

    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.delete(
    "/{guest_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_guest(guest_id: int, db: Session = Depends(get_db)) -> Response:
    guest = db.get(Guest, guest_id)
    if guest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")

    db.delete(guest)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
