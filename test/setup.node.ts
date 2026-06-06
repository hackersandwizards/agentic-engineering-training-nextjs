// Setup for the `node` project (server-side logic: lib/, app/api/).
//
// Vitest does not load .env files into process.env, and server code reads env
// vars directly (see lib/auth.ts, lib/db.ts). Provide safe test defaults so unit
// tests never fail on missing config. Override by exporting real values before
// running the tests.
process.env.JWT_SECRET ||= "test-secret";
process.env.JWT_EXPIRES_IN ||= "8d";
process.env.DATABASE_URL ||= "file:./prisma/dev.db";
