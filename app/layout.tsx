import type { Metadata } from "next";
import { Providers } from "./providers";
import "./brand.css";

export const metadata: Metadata = {
  title: "CRM - Contact Management",
  description: "Contact relationship management application",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
