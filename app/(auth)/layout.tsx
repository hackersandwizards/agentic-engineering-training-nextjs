"use client";

import { Box, Container, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isLoggedIn } from "@/lib/client/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

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
