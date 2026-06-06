# CRM Training Application (Next.js + React)

A training CRM built with Next.js 16, React 19, and Prisma 7. It covers
authentication, contact management, user administration, and a REST API, so it
serves as a realistic playground for agentic engineering exercises.

## Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Scripts](#scripts)
- [Developer Tooling](#developer-tooling)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [REST API](#rest-api)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **UI**: Chakra UI 3
- **Data fetching**: TanStack Query
- **Forms**: React Hook Form
- **Database**: SQLite via Prisma 7 (better-sqlite3 adapter)
- **Auth**: JWT tokens, bcrypt password hashing
- **Language**: TypeScript 6 (strict)

## Features

- User authentication (login / signup)
- Contact management (CRUD)
- User administration (superuser only)
- Profile and password settings
- REST API for external clients

## Quick Start

Requirements: Node.js 20+.

```bash
# 1. Install dependencies (also installs Git hooks via the prepare script)
npm install

# 2. Create the database schema and generate the Prisma client
npm run db:migrate && npx prisma generate

# 3. Seed test data (default users below)
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000.

### Default Users

| Email             | Password         | Role      |
| ----------------- | ---------------- | --------- |
| dev@example.com   | DevPassword      | Superuser |
| alice@example.com | AlicePassword123 | User      |
| bob@example.com   | BobPassword123   | User      |

## Scripts

| Script                  | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start the development server            |
| `npm run build`         | Production build                        |
| `npm run start`         | Serve the production build              |
| `npm run lint`          | Run ESLint                              |
| `npm run format`        | Format the repo with Prettier           |
| `npm run format:check`  | Check formatting without writing        |
| `npm run typecheck`     | Type-check with `tsc --noEmit`          |
| `npm run test`          | Run unit/integration tests (Vitest)     |
| `npm run test:watch`    | Vitest in watch mode                    |
| `npm run test:ui`       | Vitest browser UI                       |
| `npm run test:coverage` | Vitest with a coverage report           |
| `npm run test:e2e`      | Run end-to-end tests (Playwright)       |
| `npm run test:e2e:ui`   | Playwright UI mode                      |
| `npm run db:migrate`    | Apply Prisma migrations                 |
| `npm run db:seed`       | Seed the database                       |
| `npm run db:reset`      | Drop, recreate, and reseed the database |

## Developer Tooling

- **Package manager**: npm only. A `preinstall` guard
  (`scripts/only-npm.cjs`) rejects yarn, pnpm, and bun. Dependencies are pinned
  to exact versions, and `.npmrc` sets `save-exact=true` so new installs stay
  pinned.
- **Formatting**: Prettier. Rules live in `.prettierrc.json`; `.editorconfig`
  mirrors them so editors agree without a plugin.
- **Linting**: ESLint flat config (`eslint.config.mjs`) using
  `eslint-config-next` (core-web-vitals + TypeScript), with
  `eslint-config-prettier` last so ESLint and Prettier do not collide.
- **Type checking**: `npm run typecheck` runs `tsc --noEmit` against strict TS.
- **Testing**: Vitest for unit/integration, Playwright for E2E. See below.
- **Git hooks**: [lefthook](https://lefthook.dev) (`lefthook.yml`). On
  `pre-commit` it runs ESLint `--fix` then Prettier on staged files; on
  `pre-push` it runs the type check. Hooks install automatically through the
  `prepare` script on `npm install`. To install them by hand: `npx lefthook install`.

## Testing

The harness is set up; project-specific specs are added per exercise.

- **Vitest** (`vitest.config.mts`) runs two projects:
  - `node` for server logic in `lib/` and `app/api/` (bcrypt, JWT, Prisma).
  - `components` (jsdom) for React components in `components/` and `app/`.
  - Tests are colocated as `*.test.ts(x)` next to the code.
  - `test/render.tsx` wraps React Testing Library with the app providers
    (Chakra + React Query). Import `render` from there in component tests.
- **Playwright** (`playwright.config.ts`) runs specs from `e2e/` against a
  production build it boots itself. Note: E2E hits the real seeded
  `prisma/dev.db`, so add test-database isolation before writing specs that
  mutate data.

```bash
npm run test        # Vitest, single run
npm run test:e2e    # Playwright (builds and serves the app first)
```

## Project Structure

```
app/
├── (auth)/               # Public auth pages (login, signup)
├── (dashboard)/          # Protected pages (contacts, admin, settings)
├── api/v1/               # REST API routes
│   ├── login/            # access-token, test-token
│   ├── users/            # current user, password, signup, admin CRUD
│   └── contacts/         # contact CRUD
├── layout.tsx            # Root layout
└── providers.tsx         # Client providers (Chakra, React Query)
components/
├── layout/               # Sidebar, Navbar
├── contacts/             # Contact CRUD dialogs
└── admin/                # User management dialogs
lib/
├── db.ts                 # Prisma client singleton
├── auth.ts               # JWT & password utilities
├── api-utils.ts          # API auth/validation helpers
└── client/               # Frontend API client & hooks
prisma/
├── schema.prisma         # Database schema
├── seed.ts               # Seed script
└── migrations/           # Database migrations
test/                     # Vitest setup, custom render, type shims
e2e/                      # Playwright specs
```

## REST API

Base URL: `/api/v1`. All endpoints except login and signup require an
`Authorization: Bearer <token>` header.

### Authentication

```bash
# Get a bearer token
POST /api/v1/login/access-token
Content-Type: application/json
{ "username": "dev@example.com", "password": "DevPassword" }

# Response
{ "access_token": "...", "token_type": "Bearer" }

# Verify a token
POST /api/v1/login/test-token
Authorization: Bearer <token>
```

### Users

```bash
GET    /api/v1/users/me               # current user
PATCH  /api/v1/users/me               # update email / full_name
PATCH  /api/v1/users/me/password      # change password
POST   /api/v1/users/signup           # public signup

# Superuser only
GET    /api/v1/users                  # list users
POST   /api/v1/users                  # create user
PATCH  /api/v1/users/{id}             # update user
DELETE /api/v1/users/{id}             # delete user
```

### Contacts

```bash
GET    /api/v1/contacts               # list
POST   /api/v1/contacts               # create { organisation, description? }
GET    /api/v1/contacts/{id}          # read
PUT    /api/v1/contacts/{id}          # update
DELETE /api/v1/contacts/{id}          # delete
```

### Health Check

```bash
GET /api/v1/health-check
# Response: { "status": "ok" }
```

## Environment Variables

Configured in `.env`:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="8d"

# First superuser (used by the seed script)
FIRST_SUPERUSER_EMAIL=dev@example.com
FIRST_SUPERUSER_PASSWORD=DevPassword
```

The committed `.env` holds development-only dummy secrets so the app runs out of
the box for training. Do not reuse this pattern for real deployments.

## Contributing

1. Branch off `main`.
2. Make your change. The Git hooks do the housekeeping: `pre-commit` runs ESLint
   and Prettier on staged files, `pre-push` runs the type check.
3. Before opening a PR, run the full checks locally:

   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```

## License

For training purposes.
