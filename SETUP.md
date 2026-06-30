# Roster Frontend — Setup Guide

React 19 + TypeScript + Vite 6 + Tailwind CSS v4. Talks to `roster-backend` over REST.

---

## 1. Prerequisites

- `roster-backend` running locally on **http://localhost:3002** (see its own `SETUP.md` — migrate + seed must be done first).
- Node.js installed (works on your current Node 20.12; Vite is pinned to v6 for compatibility).

---

## 2. Install & configure

```bash
cd roster-frontend
npm install
```

[.env](.env) already points at the local backend:
```
VITE_API_BASE_URL=http://localhost:3002/api
VITE_TENANT_ID=vill-del-sole-TN-1
```

---

## 3. Run

```bash
npm run dev
```

Opens at **http://localhost:5173**

You should land on **Roster Planning**, with the sidebar giving you:
- **Roster Planning** — the matrix scheduling screen
- **Locations** — Departments (your "Villa Del Sole - X" rows)
- **Areas** — Positions (the job roles per location)
- **Employees** — staff records, optionally with login accounts

---

## 4. Walkthrough of the Roster screen

1. Pick a **Location** from the dropdown — or leave it on **"All Locations"** to see every department's roster stacked in one scrollable view, each in its own dark section header with its own Areas/positions underneath. Mass actions, Copy, Publish All, Export, and the KPI chip all operate across every department shown when "All Locations" is selected.
2. Pick a **timeline**: 1 Week / 2 Weeks / 1 Month — the grid columns extend accordingly.
3. If no roster exists yet for a department's date range, an inline **+ Create Draft Roster** button appears in that department's section (or just click **+ Add Shift** — a draft roster is created automatically the moment you save the first shift for that location).
4. Click **+ Add** in any Area row × Day column cell to open the shift form (date, area, time, employee, shift type, comment, empty/open/open-with-approval flags).
5. Click an existing shift card to edit it, or hover and click the ✕ in its corner to delete it directly.
6. Hover a card and click 🔄 to enter **swap mode**, then click a second assigned shift — their employees swap.
7. **Publish All** moves every DRAFT roster currently in view to PUBLISHED (blocked if there's nothing to publish).
8. **Copy** duplicates every roster currently in view into the following week/period, shifting dates automatically.
9. **Save Template / Load Template** (under "⋯ More") stores the current shift pattern for the *currently selected single location* (disabled while "All Locations" is selected — pick one location first). Templates are stored per-location in the browser's `localStorage`.
10. **Mark All Shifts Empty** / **Delete All Shifts** (under "⋯ More") are mass actions over every shift currently in view.
11. **Export to Excel** (under "⋯ More") downloads everything currently in view as `.xlsx`, with a Department column when multiple locations are shown.
12. The KPI bar under the toolbar shows live counts: Total / Assigned / Published / Unpublished / Open / Open(Approval) / Empty.

---

## 5. Build for production

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

---

## 6. Deploying

This is a static SPA — deploy `dist/` to **Azure Static Web Apps**, Azure Storage + CDN, or any static host. Set the production `VITE_API_BASE_URL` to your deployed `roster-backend` URL before building (Vite inlines env vars at build time).

```bash
VITE_API_BASE_URL=https://your-backend.azurewebsites.net/api npm run build
```

---

## Project structure

```
roster-frontend/
├── src/
│   ├── api/              (axios client + typed resource calls)
│   ├── components/
│   │   ├── ui/            (Button, Modal, Field/TextInput/Select)
│   │   ├── layout/         (AppLayout — sidebar nav)
│   │   └── roster/         (ShiftModal, ShiftChip, KpiBar)
│   ├── pages/             (DepartmentsPage, PositionsPage, EmployeesPage, RosterPage)
│   ├── types/              (shared TS interfaces matching backend entities)
│   ├── utils/              (date helpers, Excel export, localStorage templates)
│   ├── App.tsx             (router)
│   └── index.css           (Tailwind import + theme tokens)
├── vite.config.ts
└── .env
```

## Known simplifications (documented, not hidden)

- **Templates** are stored in browser `localStorage`, not the database — fine for single-user/single-browser use; move to a `RosterTemplate` Prisma model + API if multiple planners need to share templates.
- **Shift swap** is an immediate direct swap of the two employees on two shifts, not a request/approval workflow — the schema has `Roster.swapStatus` (PENDING/APPROVED) ready if you want to add an approval step later.
- Bulk mass actions (mark empty / delete all) call the line-item API once per shift — fine for typical roster sizes (dozens of shifts); would benefit from a dedicated bulk endpoint at very large scale.
