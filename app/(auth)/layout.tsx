"use client";

import { Box, Flex } from "@chakra-ui/react";

// No card: one narrow column, at the top on a phone, centred from 768 px.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex minH="100vh" direction="column">
      <Box h="3px" bgImage="var(--gradient-magic)" />
      <Flex
        flex={1}
        justify="center"
        align={{ base: "flex-start", md: "center" }}
      >
        <Box
          as="main"
          w="full"
          maxW="22rem"
          px={5}
          pt={{ base: 14, md: 0 }}
          pb={{ base: 10, md: 24 }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
