import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Two projects so server-side code (bcryptjs, jsonwebtoken, Prisma) runs under
// `node`, while React components run under `jsdom`. `resolve.tsconfigPaths`
// resolves the `@/*` alias straight from tsconfig.json (native Vite support).
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "mcp-server/",
        "prisma/",
        "test/",
        "e2e/",
        "**/*.config.*",
        "**/*.d.ts",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["lib/**/*.test.ts", "app/api/**/*.test.ts"],
          setupFiles: ["./test/setup.node.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["components/**/*.test.{ts,tsx}", "app/**/*.test.tsx"],
          exclude: ["app/api/**"],
          setupFiles: ["./test/setup.dom.ts"],
        },
      },
    ],
  },
});
