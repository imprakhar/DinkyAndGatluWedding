import os
from collections.abc import Generator
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]


def _normalize_database_url(raw_url: str) -> str:
    normalized = raw_url.strip()

    # Render/Railway can provide postgres:// URLs; SQLAlchemy expects postgresql://.
    if normalized.startswith("postgres://"):
        normalized = normalized.replace("postgres://", "postgresql://", 1)

    # Make relative SQLite paths deterministic by resolving them from backend dir.
    if normalized.startswith("sqlite:///"):
        sqlite_path = normalized.removeprefix("sqlite:///")
        if sqlite_path and sqlite_path != ":memory:" and not sqlite_path.startswith("/"):
            absolute_path = (BACKEND_DIR / sqlite_path).resolve()
            normalized = f"sqlite:///{absolute_path.as_posix()}"

    # Supabase Postgres requires SSL; add it automatically if missing.
    parsed = urlparse(normalized)
    if parsed.scheme == "postgresql" and (parsed.hostname or "").endswith("supabase.co"):
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        if "sslmode" not in query:
            query["sslmode"] = "require"
            normalized = urlunparse(parsed._replace(query=urlencode(query)))

    return normalized


def _default_database_url() -> str:
    env_database_url = os.getenv("DATABASE_URL")
    if env_database_url:
        return _normalize_database_url(env_database_url)

    render_persistent_disk = Path("/var/data")
    if render_persistent_disk.is_dir():
        return "sqlite:////var/data/wedding_planner.db"

    return f"sqlite:///{(BACKEND_DIR / 'wedding_planner.db').as_posix()}"


DATABASE_URL = _default_database_url()

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
