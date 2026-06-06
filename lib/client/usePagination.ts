"use client";

import { useState } from "react";

export const PAGE_SIZE = 5;

export function usePagination(pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0);
  return {
    page,
    skip: page * pageSize,
    limit: pageSize,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: (totalPages: number) =>
      setPage((p) => Math.min(totalPages - 1, p + 1)),
  };
}
