"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Chakra's colour palettes, pointed at the brand roles in brand.css. Washes
// take the brand's opacity ladder: 7, 15 and 25 %.
const palette = (fg: string, solid = fg, contrast = "var(--on-accent)") => ({
  fg: { value: fg },
  solid: { value: solid },
  contrast: { value: contrast },
  subtle: { value: `color-mix(in srgb, ${solid} 7%, transparent)` },
  muted: { value: `color-mix(in srgb, ${solid} 15%, transparent)` },
  emphasized: { value: `color-mix(in srgb, ${solid} 25%, transparent)` },
  focusRing: { value: "var(--focus)" },
  border: { value: solid },
});

const system = createSystem(defaultConfig, {
  // Light or dark follows the operating system (Apple HIG, Dark Mode).
  conditions: {
    light: "@media (prefers-color-scheme: light)",
    dark: "@media (prefers-color-scheme: dark)",
  },
  theme: {
    // A field's edge needs 3:1 (WCAG 1.4.11); the hairline border has 1.4:1.
    recipes: {
      input: {
        variants: {
          variant: { outline: { borderColor: "border.emphasized" } },
        },
      },
      textarea: {
        variants: {
          variant: { outline: { borderColor: "border.emphasized" } },
        },
      },
    },
    tokens: {
      fonts: {
        heading: { value: "var(--font-mono)" },
        body: { value: "var(--font-sans)" },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "var(--radius-sm)" },
        l2: { value: "var(--radius-sm)" },
        l3: { value: "var(--radius-brand)" },
      },
      shadows: {
        sm: { value: "var(--shadow-card)" },
        lg: { value: "var(--shadow-overlay)" },
      },
      colors: {
        bg: {
          DEFAULT: { value: "var(--background)" },
          panel: { value: "var(--surface)" },
        },
        fg: {
          DEFAULT: { value: "var(--foreground)" },
          muted: { value: "var(--foreground-muted)" },
          error: { value: "var(--error)" },
          success: { value: "var(--success)" },
        },
        border: {
          DEFAULT: { value: "var(--border)" },
          emphasized: { value: "var(--input)" },
          error: { value: "var(--error)" },
        },
        teal: palette("var(--accent)"),
        red: palette("var(--error)"),
        green: palette("var(--success)"),
        purple: palette("var(--hue-purple)"),
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
}
