"use client";

import { Box, Container, Flex } from "@chakra-ui/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex minH="100vh" direction="column">
      <Box h="3px" bgImage="var(--gradient-magic)" />
      <Flex flex={1} align="center" justify="center">
        <Container as="main" maxW="md" py={12} px={4}>
          <Box
            bg="bg.panel"
            p={{ base: 6, md: 8 }}
            borderWidth="1px"
            borderRadius="l3"
            boxShadow="sm"
          >
            {children}
          </Box>
        </Container>
      </Flex>
    </Flex>
  );
}
