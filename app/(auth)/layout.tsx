"use client";

import { Box, Container, Flex } from "@chakra-ui/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Container maxW="md" py={12}>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
          {children}
        </Box>
      </Container>
    </Flex>
  );
}
