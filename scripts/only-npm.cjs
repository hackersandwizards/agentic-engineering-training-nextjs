// Enforces npm as the only package manager. Runs as the `preinstall` lifecycle
// script. Zero dependencies, no network — it only reads the user-agent npm/yarn/
// pnpm/bun set when invoking install.
//
// Limitation: a tool that neither runs `preinstall` nor sets
// npm_config_user_agent cannot be caught here. This reliably blocks
// yarn and pnpm; it is a guardrail, not a hard security boundary.
const ua = process.env.npm_config_user_agent || "";
const pm = ua.split("/")[0];

if (pm && pm !== "npm") {
  console.error(
    "\nERROR: This repository uses npm only (detected '" +
      pm +
      "').\n" +
      "Please run: npm install\n",
  );
  process.exit(1);
}
