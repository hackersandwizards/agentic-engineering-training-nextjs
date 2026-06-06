"use client";

import { Box, Skeleton, Table, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Pagination } from "@/components/Pagination";
import { PAGE_SIZE } from "@/lib/client/usePagination";

interface DataTableColumn {
  header: string;
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn[];
  items: T[];
  renderRow: (item: T) => ReactNode;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  errorMessage: string;
  emptyMessage: string;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  items,
  renderRow,
  isLoading,
  isError,
  error,
  errorMessage,
  emptyMessage,
  page,
  totalPages,
  onPrev,
  onNext,
}: DataTableProps<T>) {
  const colSpan = columns.length;

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeader key={column.header} width={column.width}>
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: PAGE_SIZE }).map((_, rowIndex) => (
              <Table.Row key={rowIndex}>
                {columns.map((column) => (
                  <Table.Cell key={column.header}>
                    <Skeleton height="20px" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : isError ? (
            <Table.Row>
              <Table.Cell colSpan={colSpan}>
                <Text textAlign="center" color="red.500" py={4}>
                  {errorMessage}: {error?.message}
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={colSpan}>
                <Text textAlign="center" color="gray.500" py={4}>
                  {emptyMessage}
                </Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => (
              <Table.Row key={item.id}>{renderRow(item)}</Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={onPrev}
        onNext={onNext}
      />
    </Box>
  );
}
