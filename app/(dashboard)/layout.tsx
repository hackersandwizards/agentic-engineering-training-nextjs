"use client";

import { Box, Flex, Spinner, Center } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/lib/client/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  // Middleware redirects requests without a cookie. This also covers an expired
  // or invalid cookie: getCurrentUser returns null, so we send them to /login.
  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login");
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || !user) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex={1} bg="gray.50">
        <Navbar />
        <Box p={6}>{children}</Box>
      </Box>
    </Flex>
  );
}
