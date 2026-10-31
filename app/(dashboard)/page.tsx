"use client";

import { Box, Button, Heading, Text, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/lib/client/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack gap={6}>
      <Box>
        <Heading as="h1" size="2xl">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
        </Heading>
        <Text color="fg.muted" mt={2}>
          Your contacts and account settings live here.
        </Text>
      </Box>

      <Box
        bg="bg.panel"
        p={6}
        borderWidth="1px"
        borderRadius="l3"
        boxShadow="sm"
      >
        <Heading as="h2" size="md" mb={2}>
          Contacts
        </Heading>
        <Text color="fg.muted" mb={4}>
          Add the organisations you work with, then edit or delete them.
        </Text>
        <Button asChild colorPalette="teal">
          <NextLink href="/contacts">Open contacts</NextLink>
        </Button>
      </Box>
    </Stack>
  );
}
