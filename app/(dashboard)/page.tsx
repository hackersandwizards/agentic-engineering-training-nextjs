"use client";

import { Box, Heading, Text, Stack } from "@chakra-ui/react";
import { useAuth } from "@/lib/client/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Stack gap={6}>
        <Box>
          <Heading size="xl">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ""}!
          </Heading>
          <Text color="gray.600" mt={2}>
            Manage your contacts and settings from this dashboard.
          </Text>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4}>
            Quick Stats
          </Heading>
          <Text color="gray.600">
            Use the sidebar to navigate to different sections of the
            application.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
