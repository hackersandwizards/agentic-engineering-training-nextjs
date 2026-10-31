"use client";

import { Box, Flex, Spinner, Center } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AuthApi } from "@/lib/client/api";
import { useAuth } from "@/lib/client/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      // Clear a cookie the API rejects (expired, or its user is gone after
      // db:reset); proxy.ts would otherwise send /login straight back here.
      void AuthApi.logout().finally(() => router.push("/login"));
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || !user) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="teal.fg" />
      </Center>
    );
  }

  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Flex direction={{ base: "column", md: "row" }} flex={1}>
        <Sidebar />
        <Box as="main" flex={1} minW={0} p={{ base: 4, md: 8 }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
