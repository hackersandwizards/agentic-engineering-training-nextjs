// Setup for the `components` project (jsdom).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Unmount React trees between tests to avoid cross-test DOM leakage.
afterEach(() => {
  cleanup();
});

// Client components here use useRouter and usePathname (see
// app/(dashboard)/layout.tsx, components/layout/Sidebar.tsx, lib/client/useAuth.ts).
// Stub them so components render in isolation. Add more next/navigation exports
// here when a test needs them.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));
