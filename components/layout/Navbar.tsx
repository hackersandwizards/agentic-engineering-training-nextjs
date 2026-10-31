"use client";

import { Box, Button, Flex, Menu, Portal } from "@chakra-ui/react";
import { ProductMark } from "@/components/layout/ProductMark";
import { useAuth } from "@/lib/client/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <Box as="header" bg="bg.panel" borderBottomWidth="1px">
      <Box h="3px" bgImage="var(--gradient-magic)" />
      <Flex
        justify="space-between"
        align="center"
        px={{ base: 4, md: 6 }}
        h="14"
      >
        <ProductMark />

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="sm">
              {user?.fullName || user?.email || "Account"}
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel fontWeight="normal" color="fg.muted">
                    {user?.email}
                  </Menu.ItemGroupLabel>
                </Menu.ItemGroup>
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
