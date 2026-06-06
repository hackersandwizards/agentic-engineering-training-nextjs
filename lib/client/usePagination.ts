"use client";

import { useEffect, useState } from "react";

export const PAGE_SIZE = 5;

export function usePagination(pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0);
  return {
    page,
    setPage,
    skip: page * pageSize,
    limit: pageSize,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: (totalPages: number) =>
      setPage((p) => Math.max(0, Math.min(totalPages - 1, p + 1))),
  };
}

export function useClampPage(
  page: number,
  totalPages: number,
  setPage: (page: number) => void,
) {
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages, setPage]);
}
