"use client";

import { Badge, Box, Flex, Heading, Stack, Table } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersApi, type UserPublic } from "@/lib/client/api";
import { useAuth } from "@/lib/client/useAuth";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { DataTable } from "@/components/DataTable";
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { queryKeys } from "@/lib/client/queryKeys";
import { usePagination, PAGE_SIZE } from "@/lib/client/usePagination";

export default function AdminPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { page, setPage, skip, limit, prev, next } = usePagination();
  const [editUser, setEditUser] = useState<UserPublic | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserPublic | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.usersPage(page),
    queryFn: () => UsersApi.list(skip, limit),
    enabled: !!currentUser?.isSuperuser,
  });

  const users = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    if (currentUser && !currentUser.isSuperuser) {
      router.push("/");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages, setPage]);

  if (currentUser && !currentUser.isSuperuser) {
    return null;
  }

  return (
    <Box>
      <Stack gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="xl">User Management</Heading>
          <AddUserDialog />
        </Flex>

        <DataTable
          columns={[
            { header: "Name" },
            { header: "Email" },
            { header: "Role" },
            { header: "Status" },
            { header: "Actions", width: "100px" },
          ]}
          items={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          errorMessage="Failed to load users"
          emptyMessage="No users found."
          page={page}
          totalPages={totalPages}
          onPrev={prev}
          onNext={() => next(totalPages)}
          renderRow={(user) => (
            <>
              <Table.Cell fontWeight="medium">
                <Flex align="center" gap={2}>
                  {user.fullName || "-"}
                  {user.id === currentUser?.id && (
                    <Badge colorScheme="blue" size="sm">
                      You
                    </Badge>
                  )}
                </Flex>
              </Table.Cell>
              <Table.Cell color="gray.600">{user.email}</Table.Cell>
              <Table.Cell>
                <Badge colorScheme={user.isSuperuser ? "purple" : "gray"}>
                  {user.isSuperuser ? "Admin" : "User"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge colorScheme={user.isActive ? "green" : "red"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <RowActionsMenu
                  onEdit={() => setEditUser(user)}
                  onDelete={
                    user.id !== currentUser?.id
                      ? () => setDeleteUser(user)
                      : undefined
                  }
                />
              </Table.Cell>
            </>
          )}
        />
      </Stack>

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
        />
      )}

      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
        />
      )}
    </Box>
  );
}
