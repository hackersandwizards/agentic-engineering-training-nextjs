# CRM Training Application (Next.js + React)

A small CRM to practise agentic engineering on: login and signup, contacts,
user administration for a superuser, profile settings and a REST API. Built
with Next.js 16 (App Router), React 19, Chakra UI 3, TanStack Query, React Hook
Form, Prisma 7 on SQLite and TypeScript 6 in strict mode.

## Run it

You need Node.js 22.22, 24.15, or 26 and newer, the range every dependency
accepts (checked on 2026-10-31 with Node 26 and npm 12). The repo uses npm, and
`package-lock.json` is its lockfile.

```bash
npm install                                  # dependencies
npm run db:migrate && npx prisma generate    # SQLite schema and Prisma client
npm run db:seed                              # the three users below
npm run dev                                  # http://localhost:3000
```

On a fresh clone none of these commands asks a question: `db:migrate` applies
the committed migration, and `prisma generate` writes the client that
`db:migrate` leaves out. Log in with one of the seeded users:

| Email             | Password         | Role      |
| ----------------- | ---------------- | --------- |
| dev@example.com   | DevPassword      | Superuser |
| alice@example.com | AlicePassword123 | User      |
| bob@example.com   | BobPassword123   | User      |

`npm run db:reset` drops the database, migrates and seeds it again. The
committed `.env` holds the database path, a development-only JWT secret and the
seeded superuser. Never reuse it for a real deployment.

## Check your work

Before you commit, run all four; each must pass:

```bash
npm run lint           # ESLint (next core-web-vitals + TypeScript)
npm run typecheck      # tsc --noEmit
npm run format:check   # Prettier, read-only; npm run format writes the fixes
npm run test           # Vitest, single run
```

`npm run test:e2e` runs Playwright: it builds the app, serves it and runs
`e2e/` in Chromium. On a fresh machine, install the browser first with
`npx playwright install chromium`.

The test harness is set up, but the specs come with the exercises. Until you add
one, `npm run test` prints "No test files found" and `npm run test:e2e` "No
tests found", and both still pass (exit code 0).

- Vitest (`vitest.config.mts`) has two projects: `node` for `lib/` and
  `app/api/`, and `components` (jsdom) for `components/` and `app/`. Put a test
  next to its code as `*.test.ts(x)`, and import `render` from `test/render.tsx`
  in component tests, which wraps the Chakra and React Query providers.
- Playwright runs against `prisma/dev.db`, the same database `npm run dev`
  uses. Before you write a spec that changes data, give the run its own SQLite
  file. A `DATABASE_URL` in the environment overrides the one in `.env`, and
  every `*.db` file is gitignored:

  ```bash
  (export DATABASE_URL="file:./prisma/e2e.db"
   npm run db:migrate && npm run db:seed && npm run test:e2e)
  ```

  The parentheses keep the variable inside that one run, so a later
  `npm run dev` still uses `dev.db`.

Every script is in `package.json`. Dependencies are pinned exactly, and `.npmrc`
keeps new ones pinned.

## Where things are

```
app/(auth)/          login and signup pages
app/(dashboard)/     contacts, admin and settings pages (logged in)
app/api/v1/          REST API routes
app/brand.css        colours, fonts, light and dark mode (Chakra reads them in
                     app/providers.tsx)
components/          layout, contact and admin dialogs, shared table and forms
lib/                 Prisma client, JWT and password helpers, API helpers,
                     frontend API client and hooks (lib/client/)
prisma/              schema, migrations, seed script
test/                Vitest setup and the custom render
e2e/                 Playwright specs
```

## REST API

Base URL `/api/v1`. Every endpoint except login, signup, logout and the health
check needs a token, sent as `Authorization: Bearer <token>` or as the
`access_token` cookie that login sets.

```text
POST   /login/access-token     # { "username": "dev@example.com", "password": "DevPassword" }
                               # -> { "access_token": "...", "token_type": "bearer", "user": {...} }
POST   /login/test-token       # verify a token
POST   /logout                 # clear the access_token cookie
GET    /health-check           # -> { "status": "ok" }

GET    /users/me               # current user
PATCH  /users/me               # update email / full_name
DELETE /users/me               # delete own account
PATCH  /users/me/password      # change password
POST   /users/signup           # public signup

GET    /users                  # superuser: list users
POST   /users                  # superuser: create user
GET    /users/{id}             # own user, any user as superuser
PATCH  /users/{id}             # superuser: update user
DELETE /users/{id}             # superuser: delete user

GET    /contacts               # list
POST   /contacts               # create { organisation, description? }
GET    /contacts/{id}          # read
PUT    /contacts/{id}          # update
DELETE /contacts/{id}          # delete
```

## License

For training purposes only, see [LICENSE](LICENSE).
