import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .database import Base, SessionLocal, engine
from .models import BudgetItem
from .routes import budget, guests, links, rooms

DEFAULT_BUDGET_CATEGORIES = [
    "venue",
    "photography",
    "dresses",
    "makeup",
    "catering",
    "decoration",
    "music / DJ",
    "miscellaneous",
]


def seed_budget_defaults() -> None:
    db = SessionLocal()
    try:
        rows = db.execute(select(BudgetItem.category)).all()
        existing_categories = {category.lower() for (category,) in rows}
        for category in DEFAULT_BUDGET_CATEGORIES:
            if category.lower() not in existing_categories:
                db.add(BudgetItem(category=category, estimated_cost=0, actual_cost=0))
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_budget_defaults()
    yield


app = FastAPI(title="Wedding Planner API", version="1.0.0", lifespan=lifespan)

frontend_origin_raw = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allowed_origins = [item.strip() for item in frontend_origin_raw.split(",") if item.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(guests.router)
app.include_router(rooms.router)
app.include_router(budget.router)
app.include_router(links.router)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
