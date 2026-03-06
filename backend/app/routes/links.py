from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import InspirationLink
from ..schemas import InspirationLinkCreate, InspirationLinkRead

router = APIRouter(prefix="/links", tags=["Inspiration"])


@router.get("", response_model=list[InspirationLinkRead])
def get_links(
    owner_type: str | None = Query(default=None),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[InspirationLinkRead]:
    stmt = select(InspirationLink)

    if owner_type:
        stmt = stmt.where(InspirationLink.owner_type == owner_type)
    if category:
        stmt = stmt.where(InspirationLink.category == category)
    if search:
        token = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                InspirationLink.title.ilike(token),
                InspirationLink.notes.ilike(token),
                InspirationLink.category.ilike(token),
            )
        )

    stmt = stmt.order_by(InspirationLink.id.desc())
    return list(db.scalars(stmt).all())


@router.post("", response_model=InspirationLinkRead, status_code=status.HTTP_201_CREATED)
def create_link(
    payload: InspirationLinkCreate,
    db: Session = Depends(get_db),
) -> InspirationLinkRead:
    item = InspirationLink(
        title=payload.title,
        url=str(payload.url),
        category=payload.category,
        notes=payload.notes,
        owner_type=payload.owner_type,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{link_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_link(link_id: int, db: Session = Depends(get_db)) -> Response:
    item = db.get(InspirationLink, link_id)
    if item is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
