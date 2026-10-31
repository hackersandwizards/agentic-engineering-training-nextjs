"use client";

import { Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/client/useAuth";

interface NavItem {
  name: string;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/" },
  { name: "Contacts", path: "/contacts" },
  { name: "Admin", path: "/admin", adminOnly: true },
  { name: "Settings", path: "/settings" },
];

// A sidebar from 768 px, a row of tabs under the header on a phone.
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.isSuperuser,
  );

  return (
    <Flex
      as="nav"
      aria-label="Main"
      direction={{ base: "row", md: "column" }}
      gap={1}
      w={{ base: "full", md: "56" }}
      flexShrink={0}
      p={{ base: 2, md: 4 }}
      bg="bg.panel"
      borderBottomWidth={{ base: "1px", md: "0" }}
      borderRightWidth={{ base: "0", md: "1px" }}
    >
      {filteredItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            asChild
            flex={{ base: 1, md: "none" }}
            justifyContent={{ base: "center", md: "flex-start" }}
            px={3}
            py={2}
            borderRadius="l2"
            fontSize="sm"
            fontWeight="medium"
            textDecoration="none"
            color={isActive ? "teal.fg" : "fg.muted"}
            bg={isActive ? "teal.muted" : "transparent"}
            _hover={{
              textDecoration: "none",
              color: isActive ? "teal.fg" : "fg",
              bg: isActive ? "teal.muted" : "teal.subtle",
            }}
          >
            <NextLink
              href={item.path}
              aria-current={isActive ? "page" : undefined}
            >
              {item.name}
            </NextLink>
          </Link>
        );
      })}
    </Flex>
  );
}
