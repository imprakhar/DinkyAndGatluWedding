# Dinky and Gatlu Wedding (Next.js + FastAPI)

A modern Indian wedding planner for Dinky (Bride) and Gatlu (Groom), with guest and room management, budget analytics, and inspiration board.

## Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN-style UI components, Zustand, Recharts, Framer Motion
- Backend: FastAPI, SQLAlchemy, SQLite / PostgreSQL (Supabase ready)
- Deployment (free tier):
  - Frontend: Vercel
  - Backend: Render (or Fly.io / Railway)
  - Database: Supabase PostgreSQL free tier (recommended) or SQLite

## Features

- Login authentication layer (cookie-based route protection)
- Dinky (Bride) / Gatlu (Groom) mode toggle in header
- Shared modules:
  - Guest List Management (CRUD + search + filters + CSV export)
  - Rooms Management (CRUD + occupancy + guest assignment)
  - Budget Planner (estimated vs actual + overspend/savings + charts)
  - Inspiration Board (save links from any source + owner tags)
- Dashboard with live widgets:
  - Guest summary
  - Confirmed guests
  - Room usage
  - Budget summary
  - Inspiration preview
- UX:
  - Responsive layout with sidebar
  - Light/dark theme
  - Smooth animations
  - Loading states
  - Toast notifications
  - Zod validation

## Project Structure

```txt
.
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── guests/
│   │   ├── rooms/
│   │   ├── budget/
│   │   ├── inspiration/
│   │   ├── settings/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── main.py
│   └── requirements.txt
├── .env.example
└── README.md
```

## API Endpoints

### Guests
- `GET /guests`
- `POST /guests`
- `PUT /guests/{id}`
- `DELETE /guests/{id}`

### Rooms
- `GET /rooms`
- `POST /rooms`
- `PUT /rooms/{id}`
- `POST /rooms/{room_id}/assign/{guest_id}`

### Budget
- `GET /budget`
- `POST /budget`
- `PUT /budget/{id}`
- `DELETE /budget/{id}`

### Links
- `GET /links`
- `POST /links`
- `DELETE /links/{id}`

## Database Schema

### Guests
- `id`
- `name`
- `group_name`
- `phone`
- `guest_count`
- `room_id`
- `stay_type`
- `has_vehicle`
- `arrival_confirmed`
- `notes`

### Rooms
- `id`
- `room_name`
- `capacity`

### BudgetItems
- `id`
- `category`
- `estimated_cost`
- `actual_cost`

### InspirationLinks
- `id`
- `title`
- `url`
- `category`
- `notes`
- `owner_type`

## Running Locally

## 1) Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`.

## 2) Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Environment Variables

### Frontend
`frontend/.env.example`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend
`backend/.env.example`

```env
DATABASE_URL=sqlite:///wedding_planner.db
FRONTEND_ORIGIN=http://localhost:3000
```

## Login Credentials

- Groom login: `Prakhar` / `Akansha`
- Bride login: `Akansha` / `Prakhar`

## Deployment Guide

## Frontend -> Vercel (Free Tier)

1. Push repo to GitHub.
2. In Vercel, create project and set root directory to `frontend`.
3. Add env var:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend>.onrender.com`
4. Deploy.

`frontend/vercel.json` is included for standard Next.js build setup.

## Backend -> Render + Supabase (Free Tier)

1. Create a new **Web Service** in Render using this repo.
2. Set root directory to `backend`.
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. Set Python version to `3.11.11` (Render environment variable `PYTHON_VERSION=3.11.11` or keep `backend/.python-version`).

6. Create a free Supabase project:
- Open [supabase.com](https://supabase.com/) and create a new project.
- Go to `Project Settings -> Database -> Connection string`.
- Copy the SQLAlchemy/URI connection string.

7. Add Render environment variables:

```env
# Recommended for real persistence:
DATABASE_URL=<your-supabase-connection-string>
FRONTEND_ORIGIN=https://<your-vercel-domain>
```

8. Redeploy the Render service.

9. Optional SQLite mode (only if you do NOT use Supabase):
- Add a persistent disk mounted at `/var/data`
- Set `DATABASE_URL=sqlite:////var/data/wedding_planner.db`

## Notes

- Local development defaults to `backend/wedding_planner.db`.
- If data disappeared on Render, the service was likely using ephemeral storage. Use Supabase Postgres or mount a persistent disk for SQLite.
- SQLite is included and free; Supabase Postgres free tier is more reliable for production-like usage.

## Free-tier deployment alternatives

- Backend can also be deployed on Fly.io or Railway free tier.
- Frontend remains easiest on Vercel free tier.
