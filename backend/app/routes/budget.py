from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BudgetItem
from ..schemas import BudgetItemCreate, BudgetItemRead, BudgetItemUpdate

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("", response_model=list[BudgetItemRead])
def get_budget_items(db: Session = Depends(get_db)) -> list[BudgetItemRead]:
    return list(db.scalars(select(BudgetItem).order_by(BudgetItem.category.asc())).all())


@router.post("", response_model=BudgetItemRead, status_code=status.HTTP_201_CREATED)
def create_budget_item(payload: BudgetItemCreate, db: Session = Depends(get_db)) -> BudgetItemRead:
    item = BudgetItem(**payload.model_dump())
    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This budget category already exists",
        ) from exc

    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=BudgetItemRead)
def update_budget_item(
    item_id: int,
    payload: BudgetItemUpdate,
    db: Session = Depends(get_db),
) -> BudgetItemRead:
    item = db.get(BudgetItem, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget item not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(item, key, value)

    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This budget category already exists",
        ) from exc

    db.refresh(item)
    return item


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_budget_item(item_id: int, db: Session = Depends(get_db)) -> Response:
    item = db.get(BudgetItem, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
