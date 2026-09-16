# SMIT Academic Management System

A role-based academic management platform for Sikkim Manipal Institute of Technology —
students, faculty and administrators in one system, covering academics, attendance,
assignments, examinations, results, fees, notices, faculty directory, feedback and reporting.

```
client/   React 19 + Vite + Tailwind + React Router + Framer Motion + Recharts
server/   Express + Mongoose + JWT + bcrypt
```

## Running it

**Frontend.** Runs in one of two modes, decided by `VITE_API_URL`:

```bash
cd client
npm install

npm run dev                                    # sample-data mode, no backend needed
VITE_API_URL=http://localhost:4000 npm run dev # live mode, talks to the API
```

`src/data/source.js` is the only place that knows which mode is active — it
normalises live responses to the sample-data shape, so no component branches on it.

Sign in as **Student**, **Faculty** or **Administrator** — pick a role and use any
password of 6+ characters. Each role gets a different dashboard, navigation and
permission set.

**Backend** (needs MongoDB on `localhost:27017`):

```bash
cd server
npm install
cp .env.example .env        # then set JWT_SECRET
npm run seed                # demo institute: 6 students, 3 faculty, 3 courses, 6 weeks of attendance
npm run dev                 # http://localhost:4000
npm test                    # 63 checks, no database required
```

The server suite runs without MongoDB:

| Suite | Checks | What it covers |
|---|---|---|
| `test:auth` | 12 | Role gating, own-record scoping, JWT shape and rejection |
| `test:contract` | 31 | Schema validation, and that every field the UI reads survives the server → client normalisation |
| `test:routes` | 20 | Route authorisation over real HTTP with stubbed models |

`test:contract` is the one that matters most: it builds documents with the real
Mongoose schemas, shapes them exactly as each route handler does, runs them
through the client's normalisers, and fails naming any field that arrives
undefined. That is the mismatch class you would otherwise only discover on first
connection to a live database.

**Client tests** (Playwright, no test runner — see `client/test/README.md`):

```bash
npm run test:responsive     # 96 checks, needs the app on :5173
npm run test:a11y           # axe-core WCAG 2.1 AA, 26 page audits
npm run test:api            # 24 checks, needs VITE_API_URL set and the app on :5174
```

## Deploying

`client/vercel.json` is committed and configured — Vite preset, an SPA rewrite so
deep links like `/app/attendance` resolve instead of 404ing, immutable caching for
hashed assets, and nosniff/frame/referrer headers.

To deploy, import the repository at [vercel.com/new](https://vercel.com/new):

1. Pick `AreizKaran/OVERKILLz`.
2. Set **Root Directory** to `client`. Everything else is auto-detected.
3. Deploy.

That gives a git-linked project that redeploys on every push. Leave `VITE_API_URL`
unset and the deployment runs in sample-data mode, which needs no backend — the
right setting for a demo. Set it later to point at a hosted API.

## Database

An Atlas free cluster named `smit-ams` exists in the project, reachable at:

```
mongodb+srv://<user>:<password>@smit-ams.xvdogc0.mongodb.net/smit-ams
```

It has no database user yet. Create one under **Atlas → Database Access**, add your
IP under **Network Access**, then put the resulting URI in `server/.env` as
`MONGO_URI` and run `npm run seed`.

## Design system

The visual style was selected with the `ui-ux-pro-max` skill (**Minimalism & Swiss** —
its recommended style for enterprise dashboards: light/dark capable, low accessibility
risk, requires 4.5:1 text contrast, keyboard operability, visible focus and
reduced-motion support). Palette and typography follow the project brief.

### Colour

Applied 60/30/10 — neutral surfaces dominate, navy/blue carries structure, and the
remaining 10% is reserved for status. Colour never carries meaning alone: every status
pairs a hue with an icon and a text label.

| Role | Hex | Used for |
|---|---|---|
| Navy | `#14213D` | Sidebar, primary surfaces, brand |
| Blue | `#2563EB` | Interactive elements, primary data series |
| Orange | `#F97316` | Accent, notification badge, active markers |
| Emerald | `#10B981` | Healthy attendance, paid fees, success |
| Amber | `#F59E0B` | Warning attendance, pending payment |
| Coral | `#EF4444` | Critical attendance, overdue, destructive |
| Canvas / Surface | `#F8FAFC` / `#FFFFFF` | Page and card backgrounds |
| Ink / Muted | `#0F172A` / `#64748B` | Primary and secondary text |
| Line | `#E2E8F0` | Borders and dividers |

Attendance thresholds are a single source of truth in `client/src/lib/hooks.js`
(`attendanceTone`): **≥80% healthy · 75–79% warning · <75% critical**. Every ring, bar,
badge and table cell reads from it, so the 75% condonation rule renders identically
everywhere.

### Type

Inter throughout, 16px base. Numbers that get compared — percentages, marks, currency,
counts — use `font-variant-numeric: tabular-nums` (the `.tnum` class) so columns don't
jitter as values change.

### Motion

Motion is used to explain, not decorate: counters animate from zero, rings and bars draw
to value, the active sidebar marker travels between items via a shared layout element,
and route changes fade up 12px over 280ms. Every animation is disabled under
`prefers-reduced-motion` by a global rule in `index.css`, and the login graphic's
floating cards drop to a static state via `useReducedMotion`.

## Accessibility and responsive behaviour

Verified with Playwright against the breakpoints in the brief:

- **No horizontal scroll** at 320 / 375 / 414 / 768 / 1024 / 1440px across all 13 routes
  (78 checks).
- **Touch targets** are ≥44×44px at 375px — buttons, inputs, nav items and the
  attendance present/late/absent controls.
- Dialogs trap focus, close on Escape and restore focus to their trigger.
- Toasts announce via `aria-live="polite"` without stealing focus.
- Forms use visible labels, `aria-invalid` and `role="alert"` error text tied by
  `aria-describedby`.
- A skip link precedes the shell; the viewport meta does not disable zoom.
- **axe-core reports no WCAG 2.1 AA violations** across 26 page audits — every route
  for all three roles, the sign-in screen, and the mobile drawer.
- Opening the mobile drawer makes the rest of the app `inert`, so it leaves the
  accessibility tree and the tab order rather than just being visually dimmed.

Colour choices are constrained by that audit rather than by eye. Text tokens are
picked to clear 4.5:1 on every surface they land on, and the status colours have a
separate darker step for use as a fill under white text — `#EF4444` reads 3.76:1
against white, so buttons use `#DC2626` at 4.83:1, and the attendance controls use
the 700/800 steps rather than the base hues.

Mobile is a different layout, not a scaled one: bottom navigation capped at five items
with a slide-up drawer for everything else, tables re-composed as stacked cards, and the
week timetable becomes a day-by-day list.

## Security model

- Passwords hashed with bcrypt (cost 12) and never selected by default.
- JWT carries only `sub` and `role`; the server refuses to start without `JWT_SECRET`.
- `authorise(...roles)` gates staff-only routes; `ownRecordOnly()` stops a student
  reading another student's attendance, marks or fees by editing the URL.
- Students receive their own assignment submission only — never a classmate's — and the
  exam seating plan is stripped to their own seat.
- Faculty can mark attendance and grade only for courses they are assigned to.
- Marks entry (faculty) is separate from result publication (admin).
- Every faculty write — attendance, assignment creation, grading, marks entry — is
  checked against course assignment, so a lecturer cannot act on another's course.
  The permission matrix under Access Control mirrors these server rules.
- Feedback is structurally anonymous: responses carry no student reference, and a
  separate receipt collection enforces one-per-semester. Aggregates are withheld below
  five responses.
- Login is rate-limited and returns one message for both unknown user and wrong
  password, so accounts can't be enumerated.

## What is not built

- **The live API path has never run against a real server.** No MongoDB was reachable
  from the machine this was built on. The gap is narrowed from both sides — the browser
  tests drive the real fetch path against an intercepted API, and the contract test
  checks every payload shape against the real schemas — but the two halves have never
  been connected over a socket. What remains unproven is the wiring itself: connection
  handling, populate behaviour on real documents, and index enforcement.
- **Some screens have no backend at all.** Timetable, Documents, Departments and Access
  Control, the monthly-attendance and CGPA-trend charts, and the admin analytics other
  than the KPI row read fixed sample data, because the server has no model or endpoint
  behind them. Building those is server work, not wiring.
- File upload UI is present; **Multer wiring** for real uploads is not.
- No component-level unit tests. Coverage is 63 server checks plus 120 browser checks
  (96 responsive, 24 live-API).
