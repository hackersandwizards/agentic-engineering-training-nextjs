"use client";

import { Box, Button, Flex, Menu, Portal, Text } from "@chakra-ui/react";
import { useAuth } from "@/lib/client/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Contact Management
        </Text>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm">
              {user?.fullName || user?.email || "User"}
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="email" disabled>
                  <Text fontSize="sm" color="gray.500">
                    {user?.email}
                  </Text>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item value="logout" onClick={logout}>
                  Sign out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Box>
  );
}
