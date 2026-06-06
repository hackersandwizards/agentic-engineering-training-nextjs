// Setup for the `node` project (server-side logic: lib/, app/api/).
//
// Vite does not copy .env into process.env, and server code reads env vars
// directly (see lib/auth.ts). Provide safe test defaults so unit tests never
// fail on missing config. To override, create a `.env.test` file — Vitest runs
// in "test" mode and loads it automatically.
process.env.JWT_SECRET ||= "test-secret";
process.env.JWT_EXPIRES_IN ||= "8d";
process.env.DATABASE_URL ||= "file:./prisma/dev.db";
