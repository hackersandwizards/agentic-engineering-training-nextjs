// Measures the contacts list query the API runs (owner filter + created_at sort).
// Shows the SQLite query plan (SCAN vs SEARCH USING INDEX) and average latency.
// Run before and after adding an index to see the difference:
//   node scripts/perf-check.mjs
import Database from "better-sqlite3";

const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
const dbPath = url.replace(/^file:/, "");
const db = new Database(dbPath, { readonly: true });

const owner = db
  .prepare("SELECT id FROM user WHERE email = ?")
  .get("alice@example.com");
if (!owner) {
  console.error("alice@example.com not found - run `npm run db:seed` first");
  process.exit(1);
}

const sql =
  "SELECT * FROM contact WHERE owner_id = ? ORDER BY created_at DESC LIMIT 100";

console.log("EXPLAIN QUERY PLAN:");
for (const row of db.prepare("EXPLAIN QUERY PLAN " + sql).all(owner.id)) {
  console.log("  " + row.detail);
}

const runs = 5;
let total = 0;
for (let i = 0; i < runs; i++) {
  const t = performance.now();
  db.prepare(sql).all(owner.id);
  total += performance.now() - t;
}

const { c: count } = db
  .prepare("SELECT count(*) c FROM contact WHERE owner_id = ?")
  .get(owner.id);

console.log(`\ncontacts for alice: ${count}`);
console.log(`avg over ${runs} runs: ${(total / runs).toFixed(1)} ms`);
