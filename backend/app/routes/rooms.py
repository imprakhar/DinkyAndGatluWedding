from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Guest, Room
from ..schemas import RoomCreate, RoomRead, RoomUpdate

router = APIRouter(prefix="/rooms", tags=["Rooms"])


def _serialize_room(room: Room) -> RoomRead:
    guests_assigned = len(room.guests)
    occupancy = sum(guest.guest_count for guest in room.guests)
    return RoomRead(
        id=room.id,
        room_name=room.room_name,
        capacity=room.capacity,
        guests_assigned=guests_assigned,
        occupancy=occupancy,
    )


@router.get("", response_model=list[RoomRead])
def get_rooms(db: Session = Depends(get_db)) -> list[RoomRead]:
    rooms = db.scalars(select(Room).order_by(Room.room_name.asc())).all()
    return [_serialize_room(room) for room in rooms]


@router.post("", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, db: Session = Depends(get_db)) -> RoomRead:
    room = Room(**payload.model_dump())
    db.add(room)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A room with this name already exists",
        ) from exc

    db.refresh(room)
    return _serialize_room(room)


@router.put("/{room_id}", response_model=RoomRead)
def update_room(room_id: int, payload: RoomUpdate, db: Session = Depends(get_db)) -> RoomRead:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    updates = payload.model_dump(exclude_unset=True)

    if "capacity" in updates:
        occupancy = sum(guest.guest_count for guest in room.guests)
        if updates["capacity"] < occupancy:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Capacity cannot be lower than current occupancy ({occupancy})",
            )

    for key, value in updates.items():
        setattr(room, key, value)

    db.add(room)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A room with this name already exists",
        ) from exc

    db.refresh(room)
    return _serialize_room(room)


@router.post("/{room_id}/assign/{guest_id}", response_model=RoomRead)
def assign_guest_to_room(room_id: int, guest_id: int, db: Session = Depends(get_db)) -> RoomRead:
    room = db.get(Room, room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    guest = db.get(Guest, guest_id)
    if guest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")

    current_occupancy = sum(item.guest_count for item in room.guests if item.id != guest.id)
    if current_occupancy + guest.guest_count > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room capacity exceeded for {room.room_name}",
        )

    guest.room_id = room_id
    db.add(guest)
    db.commit()
    db.refresh(room)
    return _serialize_room(room)
