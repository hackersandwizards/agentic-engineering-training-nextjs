"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  Portal,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersApi, type UserPublic } from "@/lib/client/api";
import { useAuth } from "@/lib/client/useAuth";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { queryKeys } from "@/lib/client/queryKeys";

const PAGE_SIZE = 5;

export default function AdminPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const [editUser, setEditUser] = useState<UserPublic | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserPublic | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.usersPage(page),
    queryFn: () => UsersApi.list(page * PAGE_SIZE, PAGE_SIZE),
    enabled: !!currentUser?.isSuperuser,
  });

  if (currentUser && !currentUser.isSuperuser) {
    router.push("/");
    return null;
  }

  const users = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Box>
      <Stack gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="xl">User Management</Heading>
          <AddUserDialog />
        </Flex>

        <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Email</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader width="100px">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton height="20px" />
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : isError ? (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text textAlign="center" color="red.500" py={4}>
                      Failed to load users: {(error as Error).message}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : users.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text textAlign="center" color="gray.500" py={4}>
                      No users found.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                users.map((user) => (
                  <Table.Row key={user.id}>
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
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button size="sm" variant="ghost">
                            •••
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item
                                value="edit"
                                onClick={() => setEditUser(user)}
                              >
                                Edit
                              </Menu.Item>
                              {user.id !== currentUser?.id && (
                                <Menu.Item
                                  value="delete"
                                  color="red.500"
                                  onClick={() => setDeleteUser(user)}
                                >
                                  Delete
                                </Menu.Item>
                              )}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>

          {totalPages > 1 && (
            <Flex justify="center" p={4} gap={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Text alignSelf="center" color="gray.600">
                Page {page + 1} of {totalPages}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
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
