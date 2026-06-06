"use client";

import { Button, Flex, Text } from "@chakra-ui/react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Flex justify="center" p={4} gap={2}>
      <Button size="sm" variant="ghost" onClick={onPrev} disabled={page === 0}>
        Previous
      </Button>
      <Text alignSelf="center" color="gray.600">
        Page {page + 1} of {totalPages}
      </Text>
      <Button
        size="sm"
        variant="ghost"
        onClick={onNext}
        disabled={page >= totalPages - 1}
      >
        Next
      </Button>
    </Flex>
  );
}
